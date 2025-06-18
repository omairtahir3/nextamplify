import Head from 'next/head';
import Footer from "../components/footer";

export default function PremiumPage() {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <h1 className="hero-title">Get 1 month of Premium for PKR 0.00</h1>
                    <p className="hero-subtitle">
                        Enjoy ad-free music listening, offline playback, and more. Cancel anytime.
                    </p>
                    <a href="#plans" className="btn primary-btn">
                        VIEW PLAN
                    </a>
                    <p className="hero-note">
                        Individual plan only: PKR 299/month after. Terms and conditions apply. Offer only available to users who haven't already tried Premium.
                    </p>
                </div>
            </section>



            {/* Subscription Plans */}
            <section id="plans" className="plans-section">
                <div className="container">
                    <h2 className="section-title">Get our Premium plan</h2>

                    <div className="plans-grid">
                        {/* Yearly Plan */}
                        <div className="plan-card">
                            <div className="badge">SAVE 15%</div>
                            <div className="plan-header">
                                <div>
                                    <h3 className="plan-title">Premium Individual</h3>
                                    <p className="plan-type">Yearly subscription</p>
                                </div>
                                <div className="account-badge">1 account</div>
                            </div>
                            <p className="plan-price">PKR 3,588</p>
                            <p className="plan-note">PKR 299/month after offer</p>
                            <ul className="feature-list">
                                <li>Full music streaming</li>
                                <li>More songs available</li>
                                <li>Play songs in any order</li>
                                <li>High audio quality</li>
                                <li>Cancel anytime</li>
                            </ul>
                            <button href="#" className="btn full-width">GET STARTED</button>
                           
                           <p className="plan-terms">
                                Terms and conditions apply.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="comparison-section">
                <div className="container">
                    <h2 className="section-title">Experience the difference</h2>
                    <p className="comparison-subtitle">
                        Go Premium and enjoy full control of your listening. Cancel anytime.
                    </p>

                    <table className="comparison-table">
                        <thead>
                            <tr>
                                <th>What you'll get</th>
                                <th className="free-cell">Amplify Free</th>
                                <th className="premium-cell">Amplify Premium</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Full music streaming</td>
                                <td>—</td>
                                <td>✓</td>
                            </tr>
                            <tr>
                                <td>More songs available</td>
                                <td>—</td>
                                <td>✓</td>
                            </tr>
                            <tr>
                                <td>Play songs in any order</td>
                                <td>—</td>
                                <td>✓</td>
                            </tr>
                            <tr>
                                <td>High audio quality</td>
                                <td>—</td>
                                <td>✓</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            <Footer/ >
        </>
    );
}