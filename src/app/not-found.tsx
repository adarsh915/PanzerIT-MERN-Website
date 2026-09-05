import FrontendLayout from './(frontend)/layout';
import FrontendNotFound from './(frontend)/not-found';

export default async function NotFound() {
  return (
    <FrontendLayout>
      <FrontendNotFound />
    </FrontendLayout>
  );
}
