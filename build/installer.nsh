!ifndef BUILD_UNINSTALLER

!include "nsDialogs.nsh"
!include "LogicLib.nsh"

Var PosDialog
Var PosLabelIntro
Var PosLabelUser
Var PosInputUser
Var PosLabelPass
Var PosInputPass
Var PosValUser
Var PosValPass

; Inject custom credentials page right after destination directory selection
!macro customPageAfterChangeDir
  Page custom PosCredentialsPageCreate PosCredentialsPageLeave
!macroend

Function PosCredentialsPageCreate
  nsDialogs::Create 1018
  Pop $PosDialog

  ${If} $PosDialog == error
    Abort
  ${EndIf}

  ; Intro explanation
  ${NSD_CreateLabel} 0 0 100% 24u "This POS installation requires active credentials created in your Laimsoft Admin Panel. Please connect to the internet and enter your username and password below."
  Pop $PosLabelIntro

  ; Username Label & Field
  ${NSD_CreateLabel} 0 30u 100% 10u "Username:"
  Pop $PosLabelUser

  ${NSD_CreateText} 0 42u 100% 12u "$PosValUser"
  Pop $PosInputUser

  ; Password Label & Field
  ${NSD_CreateLabel} 0 60u 100% 10u "Password:"
  Pop $PosLabelPass

  ${NSD_CreatePassword} 0 72u 100% 12u "$PosValPass"
  Pop $PosInputPass

  nsDialogs::Show
FunctionEnd

Function PosCredentialsPageLeave
  ; Retrieve user input
  ${NSD_GetText} $PosInputUser $PosValUser
  ${NSD_GetText} $PosInputPass $PosValPass

  ; 1. Check for empty fields
  ${If} $PosValUser == ""
  ${OrIf} $PosValPass == ""
    MessageBox MB_ICONEXCLAMATION|MB_OK "Please enter both Username and Password to proceed with installation."
    Abort
  ${EndIf}

  ; 2. Initialize plugins directory for temporary verification files
  InitPluginsDir

  ; Extract verify.ps1 helper script
  File "/oname=$PLUGINSDIR\verify.ps1" "${__FILEDIR__}\verify.ps1"

  ; Write user inputs into isolated files in $PLUGINSDIR
  FileOpen $0 "$PLUGINSDIR\u.txt" w
  FileWrite $0 $PosValUser
  FileClose $0

  FileOpen $0 "$PLUGINSDIR\p.txt" w
  FileWrite $0 $PosValPass
  FileClose $0

  ; Execute hidden PowerShell script via nsExec
  nsExec::ExecToStack 'powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "$PLUGINSDIR\verify.ps1" -UserFile "$PLUGINSDIR\u.txt" -PassFile "$PLUGINSDIR\p.txt" -StatusFile "$PLUGINSDIR\status.txt"'
  Pop $1 ; Return code
  Pop $2 ; Console output

  ; Check status result written to file
  ${If} ${FileExists} "$PLUGINSDIR\status.txt"
    FileOpen $0 "$PLUGINSDIR\status.txt" r
    FileRead $0 $3
    FileClose $0
  ${Else}
    StrCpy $3 "Unknown verification error. Please ensure you are connected to the internet."
  ${EndIf}

  ; Cleanup sensitive temp files immediately
  Delete "$PLUGINSDIR\u.txt"
  Delete "$PLUGINSDIR\p.txt"
  Delete "$PLUGINSDIR\status.txt"
  Delete "$PLUGINSDIR\verify.ps1"

  ${If} $3 == "OK"
    ; Credentials valid and active! Proceed with installation.
  ${Else}
    MessageBox MB_ICONSTOP|MB_OK "License Verification Failed:$\r$\n$\r$\n$3"
    Abort ; Keep the user on the credentials screen and prevent install
  ${EndIf}

FunctionEnd

!endif
