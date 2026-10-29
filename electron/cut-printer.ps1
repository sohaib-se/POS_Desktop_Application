param(
    [string]$PrinterName = ""
)

if (-not $PrinterName) {
    # Look for POS-80 or thermal printer
    $printers = Get-Printer -ErrorAction SilentlyContinue
    $thermal = $printers | Where-Object { $_.Name -like "*POS*" -or $_.Name -like "*thermal*" -or $_.Name -like "*receipt*" } | Select-Object -First 1
    if ($thermal) {
        $PrinterName = $thermal.Name
    } else {
        $defaultPrn = Get-CimInstance Win32_Printer -ErrorAction SilentlyContinue | Where-Object { $_.Default -eq $true } | Select-Object -First 1
        if ($defaultPrn) { $PrinterName = $defaultPrn.Name }
    }
}

if (-not $PrinterName) {
    Write-Output "NO_PRINTER"
    exit 0
}

$code = @"
using System;
using System.Runtime.InteropServices;

public class RawCutter {
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Ansi)]
    public class DOCINFOA {
        [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
    }
    [DllImport("winspool.Drv", EntryPoint="OpenPrinterA", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);
    [DllImport("winspool.Drv", EntryPoint="ClosePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool ClosePrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint="StartDocPrinterA", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, int level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);
    [DllImport("winspool.Drv", EntryPoint="EndDocPrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint="StartPagePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint="EndPagePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint="WritePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

    public static bool SendCut(string printerName) {
        IntPtr hPrinter = IntPtr.Zero;
        DOCINFOA di = new DOCINFOA();
        di.pDocName = "Auto Cut";
        di.pDataType = "RAW";
        if (OpenPrinter(printerName, out hPrinter, IntPtr.Zero)) {
            if (StartDocPrinter(hPrinter, 1, di)) {
                if (StartPagePrinter(hPrinter)) {
                    // ESC d 3 (feed 3 lines) + GS V 66 0 (feed and partial cut)
                    byte[] cutCmd = new byte[] { 0x1B, 0x64, 0x03, 0x1D, 0x56, 0x42, 0x00 };
                    IntPtr pBytes = Marshal.AllocCoTaskMem(cutCmd.Length);
                    Marshal.Copy(cutCmd, 0, pBytes, cutCmd.Length);
                    int dwWritten = 0;
                    bool ok = WritePrinter(hPrinter, pBytes, cutCmd.Length, out dwWritten);
                    Marshal.FreeCoTaskMem(pBytes);
                    EndPagePrinter(hPrinter);
                    EndDocPrinter(hPrinter);
                    ClosePrinter(hPrinter);
                    return ok;
                }
                EndDocPrinter(hPrinter);
            }
            ClosePrinter(hPrinter);
        }
        return false;
    }
}
"@

try {
    Add-Type -TypeDefinition $code -ErrorAction Stop
    $result = [RawCutter]::SendCut($PrinterName)
    if ($result) {
        Write-Output "SUCCESS:$PrinterName"
    } else {
        Write-Output "FAILED:$PrinterName"
    }
} catch {
    Write-Output "ERROR:$($_.Exception.Message)"
}
