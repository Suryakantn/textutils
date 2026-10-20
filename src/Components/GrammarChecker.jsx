import React, { useState } from 'react'

const API_URL = 'https://api.languagetool.org/v2/check'
const MAX_CHARACTERS = 20000

export default function GrammarChecker() {
    const [text, setText] = useState('')
    const [matches, setMatches] = useState(null)
    const [error, setError] = useState('')
    const [isChecking, setIsChecking] = useState(false)

    const checkGrammar = async (event) => {
        event.preventDefault()
        if (isChecking) return
        if (!text.trim()) {
            setError('Enter some text to check.')
            setMatches(null)
            return
        }
        if (text.length > MAX_CHARACTERS) {
            setError(`Text must be ${MAX_CHARACTERS.toLocaleString()} characters or fewer.`)
            setMatches(null)
            return
        }

        setError('')
        setMatches(null)
        setIsChecking(true)
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ text, language: 'en-US' }),
            })
            if (!response.ok) {
                throw new Error(`LanguageTool returned an error (${response.status}). Please try again.`)
            }
            const result = await response.json()
            if (!Array.isArray(result.matches)) {
                throw new Error('LanguageTool returned an unexpected response. Please try again.')
            }
            setMatches(result.matches)
        } catch (requestError) {
            setError(requestError instanceof TypeError
                ? 'Could not connect to LanguageTool. Check your connection and try again.'
                : requestError.message)
        } finally {
            setIsChecking(false)
        }
    }

    const applySuggestion = (match, replacement) => {
        setText((currentText) => (
            currentText.slice(0, match.offset) + replacement + currentText.slice(match.offset + match.length)
        ))
        setMatches(null)
    }

    return (
        <section className="tool-page">
            <div className="hero-copy">
                <span className="eyebrow">ENGLISH WRITING ASSISTANT</span>
                <h1>Write with <span>confidence.</span></h1>
                <p>Check spelling and grammar, then review suggested corrections.</p>
            </div>

            <form className="editor-card grammar-form" onSubmit={checkGrammar}>
                <label className="grammar-label" htmlFor="grammar-editor">Text to check</label>
                <textarea
                    id="grammar-editor"
                    className="text-editor"
                    value={text}
                    disabled={isChecking}
                    onChange={(event) => {
                        setText(event.target.value)
                        setMatches(null)
                        setError('')
                    }}
                    placeholder="Type or paste your English text..."
                    maxLength={MAX_CHARACTERS + 1}
                />
                <div className="editor-toolbar grammar-toolbar">
                    <span>{text.length.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()} characters</span>
                    <button className="primary-button" type="submit" disabled={isChecking}>
                        {isChecking ? 'Checking…' : 'Check grammar'}
                    </button>
                </div>
                <p className="privacy-notice">
                    Grammar checking uses LanguageTool. Your text is sent to their service only when you select
                    {' '}<strong>Check grammar</strong>. Do not submit sensitive text.
                </p>
            </form>

            {error && <p className="tool-error" role="alert">{error}</p>}
            {matches && (
                <section className="grammar-results" aria-live="polite">
                    <div className="results-heading">
                        <h2>Suggestions</h2>
                        <span>{matches.length} {matches.length === 1 ? 'issue' : 'issues'}</span>
                    </div>
                    {matches.length === 0
                        ? <p className="no-issues">No issues found. Nice work!</p>
                        : (
                            <ul className="suggestion-list">
                                {matches.map((match, index) => (
                                    <li className="suggestion-card" key={`${match.offset}-${match.rule?.id || index}`}>
                                        <div>
                                            <p className="suggestion-message">{match.message}</p>
                                            {match.context?.text && (
                                                <p className="suggestion-context">
                                                    {match.context.text.slice(0, match.context.offset)}
                                                    <mark>{match.context.text.slice(match.context.offset, match.context.offset + match.context.length)}</mark>
                                                    {match.context.text.slice(match.context.offset + match.context.length)}
                                                </p>
                                            )}
                                        </div>
                                        {match.replacements?.length > 0 && (
                                            <div className="suggestion-actions">
                                                {match.replacements.slice(0, 3).map((replacement) => (
                                                    <button
                                                        className="suggestion-button"
                                                        type="button"
                                                        key={replacement.value}
                                                        onClick={() => applySuggestion(match, replacement.value)}
                                                    >
                                                        Use suggestion: {replacement.value}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                </section>
            )}
        </section>
    )
}
