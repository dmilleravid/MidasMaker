import { render } from '@testing-library/react-native';
import Home from '../app/index';

describe('Mobile Home', () => {
  it('renders links', () => {
    const { getByText } = render(<Home /> as any);
    expect(getByText('Product')).toBeTruthy();
    expect(getByText('Order')).toBeTruthy();
  });
});


