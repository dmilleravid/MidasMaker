import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home', () => {
  it('renders Next.js logo alt text', () => {
    render(<Home /> as any);
    expect(screen.getByAltText('Next.js logo')).toBeInTheDocument();
  });
});


