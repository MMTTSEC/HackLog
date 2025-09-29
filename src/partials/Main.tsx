import { Outlet } from 'react-router-dom';
import { useStateObject } from '../utils/useStateObject';

export default function Main() {
  // a state to use with outlet context
  const stateAndSetter = useStateObject({
    categoryChoice: 'All',
    sortChoice: 'Price (low to high)',
    bwImages: false
  });

  return <main>
    <Outlet context={stateAndSetter} />
  </main>;
}