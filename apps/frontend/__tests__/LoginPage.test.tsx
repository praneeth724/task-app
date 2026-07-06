import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';

const pushMock = jest.fn();
const loginMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: jest.fn() }),
}));

jest.mock('../lib/auth-context', () => ({
  useAuth: () => ({ login: loginMock }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in and redirects to /tasks on success', async () => {
    loginMock.mockResolvedValue(undefined);
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
    await userEvent.click(screen.getByText('Log in'));

    expect(loginMock).toHaveBeenCalledWith('user@example.com', 'Password123!');
    expect(pushMock).toHaveBeenCalledWith('/tasks');
  });

  it('shows an error message when login fails', async () => {
    loginMock.mockRejectedValue(new Error('Invalid email or password'));
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByText('Log in'));

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
  });
});
