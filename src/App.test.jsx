import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
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
