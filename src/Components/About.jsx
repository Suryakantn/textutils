import React from 'react'

const features = [
    ['✦', 'Useful tools, instantly', 'Change case, clean up whitespace, find and replace, or export your finished text.'],
    ['◉', 'Live writing insights', 'Keep an eye on words, characters, sentences, and estimated reading time as you write.'],
    ['⌑', 'Privacy in your hands', 'Workspace and diff tools run in your browser. Grammar checks send text to LanguageTool only when you choose to check it.'],
]

export default function About() {
    return (
        <section className="about-page">
            <div className="hero-copy">
                <span className="eyebrow">SIMPLE TOOLS. CLEAR THINKING.</span>
                <h1>A little more room<br />for <span>great words.</span></h1>
                <p>TextUtil is a focused workspace for the small writing tasks that add up to a polished piece.</p>
            </div>
            <div className="feature-grid">
                {features.map(([icon, title, description]) => (
                    <article className="feature-card" key={title}>
                        <span className="feature-icon" aria-hidden="true">{icon}</span>
                        <h2>{title}</h2>
                        <p>{description}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}
