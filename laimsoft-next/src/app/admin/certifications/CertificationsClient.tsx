'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  description?: string | null;
  certificateCount?: number;
}

interface Certificate {
  id: number;
  uniqueId: string;
  recipientName: string;
  recipientEmail: string;
  certificateTitle: string;
  courseId?: number | null;
  courseName?: string | null;
  issueDate: string;
  expiryDate?: string | null;
  issuedBy: string;
  description?: string | null;
  createdAt?: string;
}

export default function CertificationsClient({
  courses,
  certificates,
  selectedCourseId: initialCourseId,
}: {
  courses: Course[];
  certificates: Certificate[];
  selectedCourseId?: number;
}) {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<number>(
    initialCourseId || (courses[0]?.id ? courses[0].id : 0)
  );
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Course form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');

  // Certificate form
  const [certForm, setCertForm] = useState({
    recipientName: '',
    recipientEmail: '',
    certificateTitle: '',
    courseId: selectedCourseId ? String(selectedCourseId) : courses[0]?.id ? String(courses[0].id) : '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    issuedBy: 'Laimsoft Technologies',
    description: '',
  });

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const courseCerts = certificates.filter(
    (c) => c.courseId === selectedCourse?.id || (!selectedCourse && true)
  );

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_course',
          title: courseTitle.trim(),
          description: courseDesc.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Course created successfully.');
        setMessageType('success');
        setCourseTitle('');
        setCourseDesc('');
        setShowCourseModal(false);
        router.refresh();
      } else {
        setMessage(data.message || 'Unable to create course.');
        setMessageType('error');
      }
    } catch {
      setMessage('Failed to create course.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Delete this course and all of its certificates?')) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_course', courseId: id }),
      });

      if (res.ok) {
        setMessage('Course deleted successfully.');
        setMessageType('success');
        router.refresh();
      } else {
        setMessage('Unable to delete course.');
        setMessageType('error');
      }
    } catch {
      setMessage('Failed to delete course.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.recipientName || !certForm.recipientEmail || !certForm.certificateTitle) return;
    setLoading(true);

    const targetCourse = courses.find((c) => String(c.id) === String(certForm.courseId));

    try {
      const res = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'issue_certificate',
          recipientName: certForm.recipientName,
          recipientEmail: certForm.recipientEmail,
          certificateTitle: certForm.certificateTitle,
          courseId: certForm.courseId ? parseInt(certForm.courseId, 10) : undefined,
          courseName: targetCourse?.title || '',
          issueDate: certForm.issueDate,
          expiryDate: certForm.expiryDate || null,
          issuedBy: certForm.issuedBy,
          description: certForm.description,
        }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setMessage(`Certificate created successfully. Verification key: ${data.uniqueId}`);
        setMessageType('success');
        setShowCertModal(false);
        setCertForm({
          recipientName: '',
          recipientEmail: '',
          certificateTitle: '',
          courseId: selectedCourse?.id ? String(selectedCourse.id) : '',
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
          issuedBy: 'Laimsoft Technologies',
          description: '',
        });
        router.refresh();
      } else {
        setMessage(data.message || 'Unable to issue certificate.');
        setMessageType('error');
      }
    } catch {
      setMessage('Failed to issue certificate.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCert = async (certId: number) => {
    if (!confirm('Delete this certificate?')) return;
    try {
      await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_certificate', certId }),
      });
      setMessage('Certificate deleted.');
      setMessageType('success');
      router.refresh();
    } catch {
      alert('Failed to delete certificate.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Alert */}
      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            messageType === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* ── Top Hero Card (Exact 1:1 PHP certifications.php) ── */}
      <section className="rounded-[32px] border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              Certificates Admin
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Course Certificates
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Manage courses, issue certificates, and review verification links from one screen.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowCourseModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Course
            </button>
            <button
              type="button"
              onClick={() => setShowCertModal(true)}
              disabled={courses.length === 0}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 cursor-pointer ${
                courses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Issue Certificate
            </button>
          </div>
        </div>
      </section>

      {/* ── Courses Library Grid ── */}
      <section className="rounded-[32px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              Courses
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Course Library</h2>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="px-6 py-14 text-center text-slate-500">
            <span className="material-symbols-outlined mb-3 text-5xl text-slate-300 block">
              folder_open
            </span>
            <p className="text-lg font-semibold text-slate-800">No courses created yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              Add the first course to start issuing certificates.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const isActive = course.id === selectedCourseId;
              const certsForThisCourse = certificates.filter((c) => c.courseId === course.id).length;

              return (
                <div
                  key={course.id}
                  className={`group rounded-[28px] border p-5 transition cursor-pointer ${
                    isActive
                      ? 'border-slate-950 bg-slate-950 text-white shadow-xl'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white text-slate-950'
                  }`}
                  onClick={() => setSelectedCourseId(course.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${
                          isActive ? 'text-white/60' : 'text-slate-500'
                        }`}
                        style={{ fontFamily: "'Space Grotesk', monospace" }}
                      >
                        Course
                      </p>
                      <h3
                        className={`mt-2 text-xl font-bold tracking-tight ${
                          isActive ? 'text-white' : 'text-slate-950'
                        }`}
                      >
                        {course.title}
                      </h3>
                    </div>
                    <div
                      className={`rounded-2xl border px-3 py-2 text-xs font-bold shrink-0 ${
                        isActive
                          ? 'border-white/20 bg-white/10 text-white'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {certsForThisCourse} certs
                    </div>
                  </div>

                  {course.description && (
                    <p
                      className={`mt-4 text-sm leading-6 line-clamp-2 ${
                        isActive ? 'text-white/80' : 'text-slate-600'
                      }`}
                    >
                      {course.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-slate-200/20">
                    <span
                      className={`inline-flex items-center gap-2 text-sm font-semibold ${
                        isActive ? 'text-white' : 'text-slate-700'
                      }`}
                    >
                      Manage certificates{' '}
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course.id);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                          : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Certificates Table for Selected Course ── */}
      <section className="rounded-[32px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              Certificates
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {selectedCourse?.title || 'No course selected'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCertModal(true)}
            disabled={courses.length === 0}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 cursor-pointer ${
              courses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            Issue New Certificate
          </button>
        </div>

        {courseCerts.length === 0 ? (
          <div className="px-6 py-14 text-center text-slate-500">
            No certificates issued yet for this course.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead
                className="border-b border-slate-200 bg-slate-50/80 uppercase tracking-[0.12em] text-xs text-slate-500"
                style={{ fontFamily: "'Space Grotesk', monospace" }}
              >
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Recipient</th>
                  <th className="px-6 py-4 text-left font-semibold">Certificate</th>
                  <th className="px-6 py-4 text-left font-semibold">Issue Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Verification URL</th>
                  <th className="px-6 py-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courseCerts.map((cert) => {
                  const certUrl = `/v/${cert.uniqueId}`;
                  return (
                    <tr key={cert.id} className="transition hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-950">{cert.recipientName}</div>
                        <div className="text-xs text-slate-500 font-mono">{cert.recipientEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="font-medium text-slate-950">{cert.certificateTitle}</div>
                        <div className="text-xs text-slate-500">{cert.issuedBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                        {cert.issueDate}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={certUrl}
                          target="_blank"
                          rel="noopener"
                          className="break-all text-xs font-semibold text-blue-700 hover:underline font-mono"
                        >
                          {certUrl}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleDeleteCert(cert.id)}
                          className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Add Course Modal ── */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowCourseModal(false)}
          />
          <div className="relative mx-auto w-full max-w-xl rounded-[32px] bg-white p-8 shadow-2xl z-10">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  Course Studio
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Add New Course
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="rounded-2xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Course Title *</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g., Full Stack Web Development"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white"
                />
              </div>

              <div className="mb-6">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Course summary or track details..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="rounded-2xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Issue Certificate Modal ── */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowCertModal(false)}
          />
          <div className="relative mx-auto w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500"
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  Issuance Desk
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Issue New Certificate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="rounded-2xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={certForm.recipientName}
                    onChange={(e) => setCertForm({ ...certForm, recipientName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-slate-950 focus:bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={certForm.recipientEmail}
                    onChange={(e) => setCertForm({ ...certForm, recipientEmail: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-slate-950 focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Certificate Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={certForm.certificateTitle}
                    onChange={(e) => setCertForm({ ...certForm, certificateTitle: e.target.value })}
                    placeholder="Certificate of Excellence"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-slate-950 focus:bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Associated Course *
                  </label>
                  <select
                    value={certForm.courseId}
                    onChange={(e) => setCertForm({ ...certForm, courseId: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-slate-950 focus:bg-white text-sm"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={certForm.issueDate}
                    onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-slate-950 focus:bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={certForm.expiryDate}
                    onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-slate-950 focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Issued By *</label>
                <input
                  type="text"
                  required
                  value={certForm.issuedBy}
                  onChange={(e) => setCertForm({ ...certForm, issuedBy: e.target.value })}
                  placeholder="Laimsoft Technologies"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-slate-950 focus:bg-white text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={certForm.description}
                  onChange={(e) => setCertForm({ ...certForm, description: e.target.value })}
                  placeholder="Additional notes, achievements or criteria..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-slate-950 focus:bg-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="rounded-2xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? 'Issuing...' : 'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { CertificationsClient };
