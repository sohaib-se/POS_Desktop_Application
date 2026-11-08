import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, XCircle, Award, Calendar, User, BookOpen, ArrowLeft, ShieldCheck } from 'lucide-react';
import { getDb, schema } from '@/db';
import { eq } from 'drizzle-orm';

interface Props {
  params: Promise<{ code: string }>;
}


export default async function CertificateVerifyPage({ params }: Props) {
  const { code } = await params;
  const cleanCode = code ? code.trim().toUpperCase() : '';

  let certificate: any = null;

  try {
    const db = await getDb();
    const certResults = await db
      .select({
        id: schema.certificates.id,
        uniqueId: schema.certificates.uniqueId,
        recipientName: schema.certificates.recipientName,
        recipientEmail: schema.certificates.recipientEmail,
        certificateTitle: schema.certificates.certificateTitle,
        courseId: schema.certificates.courseId,
        courseName: schema.certificates.courseName,
        issueDate: schema.certificates.issueDate,
        expiryDate: schema.certificates.expiryDate,
        description: schema.certificates.description,
        issuedBy: schema.certificates.issuedBy,
        courseTitle: schema.courses.title,
        courseDesc: schema.courses.description,
      })
      .from(schema.certificates)
      .leftJoin(schema.courses, eq(schema.certificates.courseId, schema.courses.id))
      .where(eq(schema.certificates.uniqueId, cleanCode))
      .limit(1);

    if (certResults.length > 0) {
      certificate = certResults[0];
    }
  } catch (err) {
    console.error('Error fetching certificate:', err);
  }

  const isFound = !!certificate;
  const isExpired =
    certificate &&
    certificate.expiryDate &&
    new Date(certificate.expiryDate).getTime() < new Date().setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {isFound ? (
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-8 sm:p-12">
            {/* Top Verification Status Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-8 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Official Credential
                  </span>
                  <h1 className="text-xl font-black text-white">Certificate Verification</h1>
                </div>
              </div>

              {isExpired ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Expired
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified & Valid
                </div>
              )}
            </div>

            {/* Certificate Details */}
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-1">
                  Recipient Name
                </span>
                <p className="text-2xl font-black text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  {certificate.recipientName}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800/60">
                <div>
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-1">
                    Certificate Title
                  </span>
                  <p className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                    {certificate.certificateTitle}
                  </p>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-1">
                    Course / Program
                  </span>
                  <p className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                    {certificate.courseTitle || certificate.courseName || 'Professional Track'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800/60">
                <div>
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-1">
                    Issue Date
                  </span>
                  <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    {certificate.issueDate}
                  </p>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-1">
                    Credential ID
                  </span>
                  <p className="text-sm font-mono font-bold text-emerald-400 bg-slate-800/60 px-2.5 py-1 rounded-lg inline-block">
                    {certificate.uniqueId}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>Issued by: <strong className="text-white">{certificate.issuedBy || 'Laimsoft'}</strong></span>
                <span>Verified in real-time</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center rounded-3xl bg-slate-900/90 border border-slate-800 p-12 shadow-2xl">
            <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white">Certificate Not Found</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
              No official record matches the key <code className="text-rose-400 font-bold">{cleanCode}</code>. Please double-check your code.
            </p>
            <Link
              href="/v/verify"
              className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Try Another Code
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
