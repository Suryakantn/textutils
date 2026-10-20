import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('renders the workspace and updates live text statistics', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /make every word count/i })).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Text to edit'), {
    target: { value: 'Hello world!\nHow are you?' },
  });

  expect(screen.getByText('Words').nextElementSibling).toHaveTextContent('5');
  expect(screen.getByText('Characters').nextElementSibling).toHaveTextContent('25');
  expect(screen.getByText('Sentences').nextElementSibling).toHaveTextContent('2');
});

test('transforms text and replaces all matching phrases', () => {
  render(<App />);
  const editor = screen.getByLabelText('Text to edit');
  fireEvent.change(editor, { target: { value: 'hello world. hello again.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sentence case' }));
  expect(editor).toHaveValue('Hello world. Hello again.');

  fireEvent.click(screen.getByText('Find & replace'));
  fireEvent.change(screen.getByLabelText('Find'), { target: { value: 'Hello' } });
  fireEvent.change(screen.getByLabelText('Replace with'), { target: { value: 'Hi' } });
  fireEvent.click(screen.getByRole('button', { name: 'Replace all' }));
  expect(editor).toHaveValue('Hi world. Hi again.');
});

test('opens mobile navigation and toggles the color theme', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));
  expect(screen.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true');

  fireEvent.click(screen.getByRole('switch', { name: /dark mode/i }));
  expect(screen.getByRole('switch', { name: /light mode/i })).toHaveAttribute('aria-checked', 'true');
});

test('compares two versions and displays added and removed lines', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: 'Diff' }));
  fireEvent.change(screen.getByLabelText('Original text'), {
    target: { value: 'First line\nOld ending' },
  });
  fireEvent.change(screen.getByLabelText('Revised text'), {
    target: { value: 'First line\nNew ending' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Compare text' }));

  expect(screen.getByText('Old').closest('li')).toHaveClass('diff-removed');
  expect(screen.getByText('Old').closest('li')).toHaveTextContent('Old ending');
  expect(screen.getByText('New').closest('li')).toHaveClass('diff-added');
  expect(screen.getByText('New').closest('li')).toHaveTextContent('New ending');
});

test('highlights the exact words and punctuation that changed', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: 'Diff' }));
  fireEvent.change(screen.getByLabelText('Original text'), {
    target: { value: 'The quick brown fox.' },
  });
  fireEvent.change(screen.getByLabelText('Revised text'), {
    target: { value: 'The quick red fox!' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Compare text' }));

  expect(screen.getByText('brown').closest('mark')).toHaveClass('diff-inline-removed');
  expect(screen.getByText('red').closest('mark')).toHaveClass('diff-inline-added');
  expect(screen.getByText('.').closest('mark')).toHaveClass('diff-inline-removed');
  expect(screen.getByText('!').closest('mark')).toHaveClass('diff-inline-added');
  expect(screen.getByText('brown').closest('li')).toHaveTextContent('The quick brown fox.');
  expect(screen.getByText('red').closest('li')).toHaveTextContent('The quick red fox!');
});

test('checks grammar with LanguageTool and applies a suggested correction', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      matches: [{
        message: 'Use the plural demonstrative.',
        offset: 0,
        length: 4,
        context: { text: 'This are wrong.', offset: 0, length: 4 },
        replacements: [{ value: 'These' }],
        rule: { id: 'THIS_NNS' },
      }],
    }),
  });
  vi.stubGlobal('fetch', fetchMock);

  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: 'Grammar' }));
  fireEvent.change(screen.getByLabelText('Text to check'), {
    target: { value: 'This are wrong.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Check grammar' }));

  expect(await screen.findByText('Use the plural demonstrative.')).toBeInTheDocument();
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe('https://api.languagetool.org/v2/check');
  expect(new URLSearchParams(options.body).get('language')).toBe('en-US');
  expect(new URLSearchParams(options.body).get('text')).toBe('This are wrong.');

  fireEvent.click(screen.getByRole('button', { name: 'Use suggestion: These' }));
  expect(screen.getByLabelText('Text to check')).toHaveValue('These are wrong.');
});

test('shows a clear error when LanguageTool cannot be reached', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network error')));

  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: 'Grammar' }));
  fireEvent.change(screen.getByLabelText('Text to check'), {
    target: { value: 'A sentence to check.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Check grammar' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Could not connect to LanguageTool.');
});
