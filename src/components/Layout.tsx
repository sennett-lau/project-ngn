import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const Layout = (props: Props) => {
  const { children } = props;
  return (
    <div className='min-h-screen w-full flex flex-col'>
      <main className='flex-1 w-full flex flex-col'>{children}</main>
    </div>
  );
};

export default Layout;
