import { useState } from 'react';

const LeadsTable = ({ leads = [], isLoadingMore = false, setShowUpgradeModal }) => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const isPro = user ? user.isPro : false;

    const [page, setPage] = useState(1);
    const limit = 10;

    const totalPages = Math.ceil(leads.length / limit);
    const currentPage = page > totalPages ? 1 : page;
    const finalLeads = leads.slice((currentPage - 1) * limit, (currentPage - 1) * limit + limit);

    const getContactInfo = (lead) => {
        if (lead.email && lead.email !== "NA") return lead.email;
        if (lead.phone && lead.phone !== "NA") return lead.phone;
        return "No Contact Info";
    };

    const getLink = (lead) => {
        if (lead.website && lead.website !== "NA") return lead.website.startsWith("http") ? lead.website : `https://${lead.website}`;
        if (lead.linkedin && lead.linkedin !== "NA") return lead.linkedin.startsWith("http") ? lead.linkedin : `https://${lead.linkedin}`;
        if (lead.source_url && lead.source_url !== "NA") return lead.source_url;
        return null;
    };

    return (
        <div style={{
            width: '100%',
            marginTop: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 28px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#111', letterSpacing: '-0.01em' }}>
                        Leads
                    </span>
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#6b7280',
                        backgroundColor: '#f3f4f6',
                        padding: '2px 8px',
                        borderRadius: '20px',
                    }}>
                        {leads.length} result{leads.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', maxHeight: '520px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
                    <thead style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr>
                            <th style={{ padding: '14px 28px', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Company</th>
                            <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Job Title</th>
                            <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>City</th>
                            <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Country</th>
                            <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Domain</th>
                            <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Pay</th>
                            <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Contact</th>
                            <th style={{ padding: '14px 28px', fontSize: '12px', fontWeight: 600, color: '#6b7280', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {finalLeads.map((lead, index) => {
                            const link = getLink(lead);
                            return (
                                <tr
                                    key={lead._id || index}
                                    style={{
                                        borderBottom: index < finalLeads.length - 1 ? '1px solid #f5f5f5' : 'none',
                                        transition: 'background-color 0.15s ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    {/* Company */}
                                    <td style={{ padding: '16px 28px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#374151', flexShrink: 0
                                            }}>
                                                {(lead.company_name && lead.company_name !== "NA" ? lead.company_name : "?")[0].toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                                                {lead.company_name !== "NA" ? lead.company_name : "Unknown"}
                                            </span>
                                        </div>
                                    </td>
                                    
                                    {/* Job Title */}
                                    <td style={{ padding: '16px 16px', fontSize: '13px', color: '#374151', maxWidth: '180px' }}>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {lead.job_title}
                                        </div>
                                    </td>
                                    
                                    {/* City */}
                                    <td style={{ padding: '16px 16px', fontSize: '13px', color: '#6b7280' }}>
                                        {lead.city !== 'NA' ? lead.city : '-'}
                                    </td>
                                    
                                    {/* Country */}
                                    <td style={{ padding: '16px 16px', fontSize: '13px', color: '#6b7280' }}>
                                        {lead.country !== 'NA' ? lead.country : '-'}
                                    </td>
                                    
                                    {/* Domain */}
                                    <td style={{ padding: '16px 16px', fontSize: '13px', color: '#6b7280', maxWidth: '120px' }}>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {lead.domain !== 'NA' ? lead.domain : (lead.domain_category || '-')}
                                        </div>
                                    </td>
                                    
                                    {/* Pay */}
                                    <td style={{ padding: '16px 16px', fontSize: '13px', color: '#059669', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                        {lead.paying_amount !== 'NA' ? lead.paying_amount : '-'}
                                    </td>
                                    
                                    {/* Contact */}
                                    <td style={{ padding: '16px 16px', fontSize: '13px', color: '#6b7280', maxWidth: '150px' }}>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {getContactInfo(lead)}
                                        </div>
                                    </td>
                                    
                                    {/* Action */}
                                    <td style={{ padding: '16px 28px', textAlign: 'right' }}>
                                        {link ? (
                                            <a
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    fontSize: '12px', fontWeight: 500, color: '#111', textDecoration: 'none',
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '5px 12px', borderRadius: '6px', border: '1px solid #e5e7eb',
                                                    backgroundColor: '#fff', transition: 'all 0.15s ease'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.backgroundColor = '#111';
                                                    e.currentTarget.style.color = '#fff';
                                                    e.currentTarget.style.borderColor = '#111';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.backgroundColor = '#fff';
                                                    e.currentTarget.style.color = '#111';
                                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                                }}
                                            >
                                                View
                                            </a>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#d1d5db' }}>No Link</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {(totalPages > 1 || !isPro) && (
                <div style={{
                    padding: '14px 28px',
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Page {currentPage} of {!isPro ? 'Many' : totalPages}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '5px 14px',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: currentPage === 1 ? '#d1d5db' : '#374151',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={() => {
                                if (!isPro) {
                                    setShowUpgradeModal(true);
                                } else {
                                    setPage(p => Math.min(totalPages, p + 1));
                                }
                            }}
                            disabled={isPro && currentPage === totalPages}
                            style={{
                                padding: '5px 14px',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: (isPro && currentPage === totalPages) ? '#d1d5db' : '#374151',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                                cursor: (isPro && currentPage === totalPages) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Loading more indicator */}
            {isLoadingMore && (
                <div style={{
                    padding: '14px 28px',
                    borderTop: totalPages > 1 ? 'none' : '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}>
                    <style>{`
                        @keyframes spin { to { transform: rotate(360deg); } }
                        @keyframes loadingShimmer {
                            0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; }
                        }
                    `}</style>
                    <svg
                        width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"
                        style={{ animation: 'spin 0.9s linear infinite', flexShrink: 0 }}
                    >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        animation: 'loadingShimmer 1.6s ease-in-out infinite',
                    }}>
                        Fetching more leads...
                    </span>
                </div>
            )}
        </div>
    );
};

export default LeadsTable;
