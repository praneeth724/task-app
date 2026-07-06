import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from '../components/TaskList';
import type { Task } from '../types/task';

const baseTask: Task = {
  id: '1',
  title: 'Write documentation',
  description: '',
  status: 'TODO',
  dueDate: null,
  ownerId: 'owner-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('TaskList', () => {
  it('shows an empty state when there are no tasks', () => {
    render(<TaskList tasks={[]} onDelete={jest.fn()} isDeleting={false} />);
    expect(screen.getByText('No tasks found.')).toBeInTheDocument();
  });

  it('renders each task with its status', () => {
    render(<TaskList tasks={[baseTask]} onDelete={jest.fn()} isDeleting={false} />);
    expect(screen.getByText('Write documentation')).toBeInTheDocument();
    expect(screen.getByText('TODO')).toBeInTheDocument();
  });

  it('calls onDelete with the task id', async () => {
    const onDelete = jest.fn();
    render(<TaskList tasks={[baseTask]} onDelete={onDelete} isDeleting={false} />);

    await userEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
