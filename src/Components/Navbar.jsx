import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

function Navbar({ title, mode, toggleMode }) {
    const [menuOpen, setMenuOpen] = useState(false)

    const closeMenu = () => setMenuOpen(false)

    return (
        <header className="site-header">
            <nav className="nav-container" aria-label="Main navigation">
                <Link className="brand" to="/" onClick={closeMenu}>
                    <span className="brand-mark" aria-hidden="true">T</span>
                    <span>{title}<small>TEXT WORKSPACE</small></span>
                </Link>
                <button
                    className="menu-toggle"
                    type="button"
                    aria-expanded={menuOpen}
                    aria-controls="primary-navigation"
                    aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span />
                    <span />
                    <span />
                </button>
                <div className={`nav-content${menuOpen ? ' is-open' : ''}`} id="primary-navigation">
                    <div className="nav-links">
                        <NavLink to="/" end onClick={closeMenu}>Workspace</NavLink>
                        <NavLink to="/about" onClick={closeMenu}>About</NavLink>
                    </div>
                    <button
                        className="theme-toggle"
                        type="button"
                        role="switch"
                        aria-checked={mode === 'dark'}
                        onClick={toggleMode}
                    >
                        <span aria-hidden="true">{mode === 'light' ? '☾' : '☀'}</span>
                        {mode === 'light' ? 'Dark mode' : 'Light mode'}
                    </button>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
