import React from 'react'

export default function Alert({ alert }) {
    if (!alert) return null
    return (
        <div className={`toast-message toast-${alert.type}`} role="status" aria-live="polite">
            <span aria-hidden="true">{alert.type === 'danger' ? '!' : '✓'}</span>
            {alert.message}
        </div>
    )
}
