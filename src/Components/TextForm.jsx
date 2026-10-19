import React, { useMemo, useState } from 'react'

const wordCount = (value) => {
    const trimmed = value.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
}

const titleCase = (value) => value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())

const sentenceCase = (value) => value.toLowerCase()
    .replace(/(^\s*\S|[.!?]["')\]]*\s+\S)/g, (match) => match.toUpperCase())

export default function TextForm({ mode, showAlert }) {
    const [text, setText] = useState('')
    const [findText, setFindText] = useState('')
    const [replaceText, setReplaceText] = useState('')

    const stats = useMemo(() => {
        const words = wordCount(text)
        const sentences = text.trim()
            ? text.trim().split(/[.!?]+/).filter((sentence) => sentence.trim()).length
            : 0

        return {
            words,
            characters: text.length,
            charactersWithoutSpaces: text.replace(/\s/g, '').length,
            sentences,
            readingTime: words ? Math.max(1, Math.ceil(words / 200)) : 0,
        }
    }, [text])

    const transform = (operation, successMessage) => {
        if (!text) {
            showAlert('Add some text first.', 'danger')
            return
        }
        setText(operation(text))
        showAlert(successMessage)
    }

    const copyText = async () => {
        if (!text) {
            showAlert('Add some text before copying.', 'danger')
            return
        }
        try {
            await navigator.clipboard.writeText(text)
            showAlert('Text copied to clipboard.')
        } catch {
            showAlert('Clipboard access is unavailable. Check your browser permissions.', 'danger')
        }
    }

    const downloadText = () => {
        if (!text) {
            showAlert('Add some text before downloading.', 'danger')
            return
        }
        const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
        const link = document.createElement('a')
        link.href = url
        link.download = 'textutils-note.txt'
        link.click()
        URL.revokeObjectURL(url)
        showAlert('Your text file has been downloaded.')
    }

    const replaceMatches = () => {
        if (!findText) {
            showAlert('Enter the text you want to find.', 'danger')
            return
        }
        const matches = text.split(findText).length - 1
        if (!matches) {
            showAlert('No matching text was found.', 'danger')
            return
        }
        setText(text.split(findText).join(replaceText))
        showAlert(`Replaced ${matches} ${matches === 1 ? 'match' : 'matches'}.`)
    }

    const clearText = () => {
        if (!text) {
            showAlert('Your text is already empty.', 'danger')
            return
        }
        setText('')
        showAlert('Text cleared.')
    }

    return (
        <section className="editor-page">
            <div className="hero-copy">
                <span className="eyebrow">YOUR PRIVATE WRITING SPACE</span>
                <h1>Make every word <span>count.</span></h1>
                <p>Polish, transform, and understand your text — all right here in your browser.</p>
            </div>

            <div className="editor-card">
                <div className="editor-heading">
                    <div>
                        <h2>Text editor</h2>
                        <p>Start typing or paste your text below</p>
                    </div>
                    <span className="privacy-badge"><span aria-hidden="true">●</span> Private by design</span>
                </div>

                <label className="visually-hidden" htmlFor="text-editor">Text to edit</label>
                <textarea
                    id="text-editor"
                    className="text-editor"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Type or paste something wonderful..."
                    spellCheck="true"
                />

                <div className="editor-toolbar">
                    <span>{stats.characters} characters</span>
                    <div className="toolbar-actions">
                        <button className="quiet-button" type="button" onClick={copyText}>Copy</button>
                        <button className="quiet-button" type="button" onClick={downloadText}>Download .txt</button>
                        <button className="quiet-button danger-text" type="button" onClick={clearText}>Clear</button>
                    </div>
                </div>

                <div className="tool-section">
                    <h3>Quick tools</h3>
                    <div className="tool-buttons">
                        <button type="button" onClick={() => transform((value) => value.toUpperCase(), 'Converted to uppercase.')}>UPPERCASE</button>
                        <button type="button" onClick={() => transform((value) => value.toLowerCase(), 'Converted to lowercase.')}>lowercase</button>
                        <button type="button" onClick={() => transform(titleCase, 'Converted to title case.')}>Title Case</button>
                        <button type="button" onClick={() => transform(sentenceCase, 'Converted to sentence case.')}>Sentence case</button>
                        <button type="button" onClick={() => transform((value) => Array.from(value).reverse().join(''), 'Text reversed.')}>Reverse</button>
                        <button type="button" onClick={() => transform((value) => value.trim().replace(/\s+/g, ' '), 'Extra whitespace removed.')}>Clean spaces</button>
                    </div>
                </div>

                <details className="find-replace">
                    <summary>Find &amp; replace</summary>
                    <div className="find-replace-fields">
                        <label>
                            Find
                            <input value={findText} onChange={(event) => setFindText(event.target.value)} placeholder="Text to find" />
                        </label>
                        <label>
                            Replace with
                            <input value={replaceText} onChange={(event) => setReplaceText(event.target.value)} placeholder="Replacement" />
                        </label>
                        <button type="button" onClick={replaceMatches}>Replace all</button>
                    </div>
                </details>
            </div>

            <section className="summary-section" aria-label="Text statistics">
                <div className="summary-heading">
                    <div>
                        <span className="eyebrow">AT A GLANCE</span>
                        <h2>Your text, summed up.</h2>
                    </div>
                    <span className="live-indicator"><span aria-hidden="true" /> Live stats</span>
                </div>
                <div className="stats-grid">
                    <Stat label="Words" value={stats.words} />
                    <Stat label="Characters" value={stats.characters} />
                    <Stat label="No-space chars" value={stats.charactersWithoutSpaces} />
                    <Stat label="Sentences" value={stats.sentences} />
                    <Stat label="Reading time" value={stats.readingTime ? `${stats.readingTime} min` : '—'} />
                </div>
                <div className="preview-card">
                    <h3>Live preview</h3>
                    <p>{text || 'Your edited text will appear here as you type.'}</p>
                </div>
            </section>
        </section>
    )
}

function Stat({ label, value }) {
    return (
        <div className="stat-card">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    )
}
