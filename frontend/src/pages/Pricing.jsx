import { useNavigate } from "react-router-dom";

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
        <circle cx="8" cy="8" r="8" fill="#16a34a" fillOpacity="0.12" />
        <path d="M5 8.5l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
        <circle cx="8" cy="8" r="8" fill="#a1a1aa" fillOpacity="0.12" />
        <path d="M5 8.5l2 2 4-4" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const plans = [
    {
        name: "Starter",
        price: "$10",
        period: "/ month",
        tagline: "Perfect for freelancers & solo founders.",
        highlight: false,
        cta: "Get Started",
        ctaRoute: "/signup",
        features: [
            { label: "Unlimited lead generation", active: true },
            { label: "AI-powered client matching", active: true },
            { label: "Export as Excel", active: false },
            { label: "Automated cold email agent", active: false },
        ],
    },
    {
        name: "Pro",
        price: "$40",
        period: "/ month",
        tagline: "For teams ready to scale outreach.",
        highlight: true,
        badge: "Most Popular",
        cta: "Start Pro",
        ctaRoute: "/signup",
        features: [
            { label: "Unlimited lead generation", active: true },
            { label: "AI-powered client matching", active: true },
            { label: "Export leads as Excel", active: true },
            { label: "Automated cold email agent", active: true },
        ],
    },
    {
        name: "Enterprise",
        price: null,
        period: null,
        tagline: "Advanced automation & custom workflows.",
        highlight: false,
        soon: true,
        cta: "Coming Soon",
        ctaRoute: null,
        features: [
            { label: "Everything in Pro", active: false },
            { label: "Generate Leads and Send Mails Everyday", active: false },
            { label: "Notify You When Task Done", active: false },
            { label: "Priority support", active: false }
        ],
    },
];

const Pricing = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            {/* Nav */}
            <div style={{
                width: '100%',
                borderBottom: '1px solid #e4e4e7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 48px',
                height: '60px',
                position: 'sticky',
                top: 0,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(12px)',
                zIndex: 50,
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ fontWeight: 700, fontSize: '17px', color: '#18181b', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '-0.3px' }}
                >
                    clientsmine
                </button>
    
            </div>

            {/* Hero text */}
            <div style={{ textAlign: 'center', padding: '80px 24px 56px', maxWidth: '600px' }}>
                <div style={{
                    display: 'inline-block',
                    background: '#f4f4f5',
                    color: '#71717a',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 12px',
                    borderRadius: '100px',
                    marginBottom: '20px',
                }}>
                    Be a Pro Member and Connect to Lead From Day-1
                </div>
                <h1 style={{
                    fontSize: '48px',
                    fontWeight: 700,
                    color: '#18181b',
                    lineHeight: '1.15',
                    letterSpacing: '-1.5px',
                    margin: '0 0 16px',
                }}>
                    Pay for results,<br />not just access.
                </h1>
                <p style={{ fontSize: '16px', color: '#71717a', lineHeight: '1.6', margin: 0 }}>
                    Generate unlimited leads from day one. Upgrade when you're ready to automate your entire outreach.
                </p>
            </div>

            {/* Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                maxWidth: '960px',
                width: '100%',
                padding: '0 24px 100px',
            }}>
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        style={{
                            background: plan.highlight ? '#18181b' : '#fff',
                            border: plan.highlight ? '1.5px solid #18181b' : '1.5px solid #e4e4e7',
                            borderRadius: '16px',
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            opacity: plan.soon ? 0.6 : 1,
                        }}
                    >
                        {/* Badge */}
                        {plan.badge && (
                            <div style={{
                                position: 'absolute',
                                top: '-13px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: '#16a34a',
                                color: '#fff',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                padding: '4px 14px',
                                borderRadius: '100px',
                                whiteSpace: 'nowrap',
                            }}>
                                {plan.badge}
                            </div>
                        )}

                        {/* Plan name */}
                        <div style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: plan.highlight ? '#a1a1aa' : '#71717a',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            marginBottom: '12px',
                        }}>
                            {plan.name}
                        </div>

                        {/* Price */}
                        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                            {plan.soon ? (
                                <span style={{ fontSize: '32px', fontWeight: 700, color: plan.highlight ? '#fff' : '#18181b', letterSpacing: '-1px', lineHeight: 1 }}>
                                    Soon™
                                </span>
                            ) : (
                                <>
                                    <span style={{ fontSize: '44px', fontWeight: 800, color: plan.highlight ? '#fff' : '#18181b', letterSpacing: '-2px', lineHeight: 1 }}>
                                        {plan.price}
                                    </span>
                                    <span style={{ fontSize: '14px', color: plan.highlight ? '#71717a' : '#a1a1aa', marginBottom: '6px' }}>
                                        {plan.period}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Tagline */}
                        <p style={{
                            fontSize: '13px',
                            color: plan.highlight ? '#a1a1aa' : '#71717a',
                            lineHeight: '1.5',
                            margin: '0 0 28px',
                        }}>
                            {plan.tagline}
                        </p>

                        {/* Divider */}
                        <div style={{ height: '1px', background: plan.highlight ? '#2d2d33' : '#f4f4f5', marginBottom: '24px' }} />

                        {/* Features */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                            {plan.features.map((f) => (
                                <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    {plan.soon ? <SoonIcon /> : f.active ? <CheckIcon /> : <SoonIcon />}
                                    <span style={{
                                        fontSize: '13px',
                                        color: plan.soon
                                            ? '#a1a1aa'
                                            : f.active
                                                ? plan.highlight ? '#e4e4e7' : '#3f3f46'
                                                : '#a1a1aa',
                                        textDecoration: !f.active && !plan.soon ? 'line-through' : 'none',
                                        lineHeight: '1.4',
                                    }}>
                                        {f.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <button
                            onClick={() => navigate("/payment")}
                            disabled={plan.soon}
                            style={{
                                marginTop: '32px',
                                width: '100%',
                                padding: '12px 0',
                                fontSize: '14px',
                                fontWeight: 700,
                                borderRadius: '10px',
                                border: plan.highlight ? 'none' : '1.5px solid #e4e4e7',
                                background: plan.highlight ? '#16a34a' : plan.soon ? '#f4f4f5' : '#fff',
                                color: plan.highlight ? '#fff' : plan.soon ? '#a1a1aa' : '#18181b',
                                cursor: plan.soon ? 'not-allowed' : 'pointer',
                                transition: 'opacity 0.15s',
                                letterSpacing: '-0.2px',
                            }}
                            onMouseEnter={e => { if (!plan.soon) e.currentTarget.style.opacity = '0.85'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer note */}
            <div style={{ textAlign: 'center', paddingBottom: '60px' }}>
                <p style={{ fontSize: '13px', color: '#a1a1aa' }}>
                    No contracts. Cancel anytime. Questions?{' '}
                    <a href="mailto:hello@clientsmine.com" style={{ color: '#18181b', fontWeight: 600, textDecoration: 'none' }}>
                        hello@clientsmine.com
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Pricing;
