import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
  it('shows a validation error when submitting an empty title', async () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} onCancel={jest.fn()} isSubmitting={false} />);

    await userEvent.click(screen.getByText('Save task'));

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the entered title and description', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} onCancel={jest.fn()} isSubmitting={false} />);

    await userEvent.type(screen.getByLabelText('Title'), 'Ship the feature');
    await userEvent.type(screen.getByLabelText('Description'), 'Finish before Friday');
    await userEvent.click(screen.getByText('Save task'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Ship the feature', description: 'Finish before Friday' }),
    );
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = jest.fn();
    render(<TaskForm onSubmit={jest.fn()} onCancel={onCancel} isSubmitting={false} />);

    await userEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
