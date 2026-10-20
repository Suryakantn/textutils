import React, { useState } from 'react'

const MAX_LINES = 1000

function appendPart(parts, type, text) {
    const previousPart = parts[parts.length - 1]
    if (previousPart?.type === type) {
        previousPart.text += text
    } else {
        parts.push({ type, text })
    }
}

function compareWords(originalText, revisedText) {
    const originalWords = originalText.match(/\s+|[\p{L}\p{N}_]+|[^\s]/gu) || []
    const revisedWords = revisedText.match(/\s+|[\p{L}\p{N}_]+|[^\s]/gu) || []
    const lengths = Array.from(
        { length: originalWords.length + 1 },
        () => new Uint16Array(revisedWords.length + 1)
    )

    for (let originalIndex = originalWords.length - 1; originalIndex >= 0; originalIndex -= 1) {
        for (let revisedIndex = revisedWords.length - 1; revisedIndex >= 0; revisedIndex -= 1) {
            lengths[originalIndex][revisedIndex] = originalWords[originalIndex] === revisedWords[revisedIndex]
                ? lengths[originalIndex + 1][revisedIndex + 1] + 1
                : Math.max(lengths[originalIndex + 1][revisedIndex], lengths[originalIndex][revisedIndex + 1])
        }
    }

    const originalParts = []
    const revisedParts = []
    let originalIndex = 0
    let revisedIndex = 0

    while (originalIndex < originalWords.length && revisedIndex < revisedWords.length) {
        if (originalWords[originalIndex] === revisedWords[revisedIndex]) {
            appendPart(originalParts, 'unchanged', originalWords[originalIndex])
            appendPart(revisedParts, 'unchanged', revisedWords[revisedIndex])
            originalIndex += 1
            revisedIndex += 1
        } else if (lengths[originalIndex + 1][revisedIndex] >= lengths[originalIndex][revisedIndex + 1]) {
            appendPart(originalParts, 'removed', originalWords[originalIndex])
            originalIndex += 1
        } else {
            appendPart(revisedParts, 'added', revisedWords[revisedIndex])
            revisedIndex += 1
        }
    }

    while (originalIndex < originalWords.length) {
        appendPart(originalParts, 'removed', originalWords[originalIndex])
        originalIndex += 1
    }
    while (revisedIndex < revisedWords.length) {
        appendPart(revisedParts, 'added', revisedWords[revisedIndex])
        revisedIndex += 1
    }

    return { originalParts, revisedParts }
}

function compareLines(originalText, revisedText) {
    const originalLines = originalText.split(/\r?\n/)
    const revisedLines = revisedText.split(/\r?\n/)
    const lengths = Array.from(
        { length: originalLines.length + 1 },
        () => new Uint16Array(revisedLines.length + 1)
    )

    for (let originalIndex = originalLines.length - 1; originalIndex >= 0; originalIndex -= 1) {
        for (let revisedIndex = revisedLines.length - 1; revisedIndex >= 0; revisedIndex -= 1) {
            lengths[originalIndex][revisedIndex] = originalLines[originalIndex] === revisedLines[revisedIndex]
                ? lengths[originalIndex + 1][revisedIndex + 1] + 1
                : Math.max(lengths[originalIndex + 1][revisedIndex], lengths[originalIndex][revisedIndex + 1])
        }
    }

    const changes = []
    let originalIndex = 0
    let revisedIndex = 0

    while (originalIndex < originalLines.length && revisedIndex < revisedLines.length) {
        if (originalLines[originalIndex] === revisedLines[revisedIndex]) {
            changes.push({ type: 'unchanged', text: originalLines[originalIndex] })
            originalIndex += 1
            revisedIndex += 1
        } else if (lengths[originalIndex + 1][revisedIndex] >= lengths[originalIndex][revisedIndex + 1]) {
            changes.push({ type: 'removed', text: originalLines[originalIndex] })
            originalIndex += 1
        } else {
            changes.push({ type: 'added', text: revisedLines[revisedIndex] })
            revisedIndex += 1
        }
    }

    while (originalIndex < originalLines.length) {
        changes.push({ type: 'removed', text: originalLines[originalIndex] })
        originalIndex += 1
    }
    while (revisedIndex < revisedLines.length) {
        changes.push({ type: 'added', text: revisedLines[revisedIndex] })
        revisedIndex += 1
    }

    for (let start = 0; start < changes.length;) {
        if (changes[start].type === 'unchanged') {
            start += 1
            continue
        }

        let end = start
        while (end < changes.length && changes[end].type !== 'unchanged') end += 1
        const removed = changes.slice(start, end).filter((change) => change.type === 'removed')
        const added = changes.slice(start, end).filter((change) => change.type === 'added')

        for (let index = 0; index < Math.min(removed.length, added.length); index += 1) {
            const { originalParts, revisedParts } = compareWords(removed[index].text, added[index].text)
            removed[index].parts = originalParts
            added[index].parts = revisedParts
        }
        start = end
    }

    return changes
}

export default function DiffChecker() {
    const [original, setOriginal] = useState('')
    const [revised, setRevised] = useState('')
    const [changes, setChanges] = useState(null)
    const [error, setError] = useState('')

    const updateText = (setter, value) => {
        setter(value)
        setChanges(null)
        setError('')
    }

    const compare = () => {
        if (original.split(/\r?\n/).length > MAX_LINES || revised.split(/\r?\n/).length > MAX_LINES) {
            setChanges(null)
            setError(`Each version can contain up to ${MAX_LINES.toLocaleString()} lines.`)
            return
        }
        setError('')
        setChanges(compareLines(original, revised))
    }

    const addedCount = changes?.filter((change) => change.type === 'added').length ?? 0
    const removedCount = changes?.filter((change) => change.type === 'removed').length ?? 0

    return (
        <section className="tool-page">
            <div className="hero-copy">
                <span className="eyebrow">COMPARE TWO VERSIONS</span>
                <h1>Spot every <span>change.</span></h1>
                <p>Compare two versions of your text to see added and removed words, punctuation, and lines. Your content stays in this browser.</p>
            </div>

            <div className="editor-card">
                <div className="compare-inputs">
                    <label>
                        Original text
                        <textarea
                            className="text-editor"
                            value={original}
                            onChange={(event) => updateText(setOriginal, event.target.value)}
                            placeholder="Paste the original version..."
                        />
                    </label>
                    <label>
                        Revised text
                        <textarea
                            className="text-editor"
                            value={revised}
                            onChange={(event) => updateText(setRevised, event.target.value)}
                            placeholder="Paste the revised version..."
                        />
                    </label>
                </div>
                <div className="tool-actions">
                    <button className="primary-button" type="button" onClick={compare}>Compare text</button>
                </div>
            </div>

            {error && <p className="tool-error" role="alert">{error}</p>}
            {changes && (
                <section className="diff-results" aria-label="Diff results">
                    <div className="results-heading">
                        <h2>Comparison</h2>
                        <span><span className="diff-added-count">+{addedCount}</span> added · <span className="diff-removed-count">−{removedCount}</span> removed</span>
                    </div>
                    {addedCount === 0 && removedCount === 0
                        ? <p className="no-issues">The two versions are identical.</p>
                        : (
                            <ol className="diff-output" aria-label="Line-by-line changes">
                                {changes.map((change, index) => (
                                    <li className={`diff-line diff-${change.type}`} key={`${index}-${change.type}`}>
                                        <span aria-hidden="true">{change.type === 'added' ? '+' : change.type === 'removed' ? '−' : ' '}</span>
                                        <code>{(change.parts || [{ type: change.type, text: change.text || ' ' }]).map((part, partIndex) => (
                                            part.type === 'unchanged'
                                                ? <React.Fragment key={partIndex}>{part.text}</React.Fragment>
                                                : <mark className={`diff-inline-${part.type}`} key={partIndex}>{part.text}</mark>
                                        ))}</code>
                                    </li>
                                ))}
                            </ol>
                        )}
                </section>
            )}
        </section>
    )
}
