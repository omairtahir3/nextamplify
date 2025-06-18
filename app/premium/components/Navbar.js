import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="amplify-nav-container">
            <div className="amplify-nav-logo flex items-center space-x-3">
                <div className="amplify-nav-logo-circle bg-white p-2 rounded-full">
                    <img
                        src="https://cdn.pixabay.com/photo/2022/09/25/03/20/music-7477530_1280.png"
                        alt="Amplify Logo"
                        className="amplify-nav-logo-img"
                    />
                </div>
                <h1>Amplify</h1>
            </div>


            <div className="amplify-nav-actions">
                <ul className="amplify-nav-links">
                    <li><Link href="/signup">Sign up</Link></li>
                    <li>
                        <Link href="/signin">
                            <span className="amplify-nav-login-btn bg-white text-black font-semibold py-2 px-4 rounded hover:bg-gray-200 transition">
                                Log in
                            </span>
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;