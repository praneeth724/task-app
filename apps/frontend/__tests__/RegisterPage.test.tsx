import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '../app/register/page';

const pushMock = jest.fn();
const registerMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: jest.fn() }),
}));

jest.mock('../lib/auth-context', () => ({
  useAuth: () => ({ register: registerMock }),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers and redirects to /tasks on success', async () => {
    registerMock.mockResolvedValue(undefined);
    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText('Name'), 'Alice');
    await userEvent.type(screen.getByLabelText('Email'), 'alice@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
    await userEvent.click(screen.getByText('Register'));

    expect(registerMock).toHaveBeenCalledWith('Alice', 'alice@example.com', 'Password123!');
    expect(pushMock).toHaveBeenCalledWith('/tasks');
  });
});
