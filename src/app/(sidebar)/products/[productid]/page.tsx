import { getProductById } from '@/actions/product-actions';
import { ObjectId } from 'mongodb';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface PageParamsProps {
  params: Promise<{ productid: string }>;
}

const Page = async ({ params }: PageParamsProps) => {
  const { productid } = await params;

  if (!ObjectId.isValid(productid)) {
    notFound();
  }

  const { data } = await getProductById({ id: productid });
  if (!data) {
    notFound();
  }

  const { data:product } = data;

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className='font-bold'>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Product Name</TableCell>
                <TableCell>{product?.product_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Quantity</TableCell>
                <TableCell>{product?.quantity}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Price</TableCell>
                <TableCell>₹ {product?.price.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Brand</TableCell>
                <TableCell>{product?.brandId || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Category</TableCell>
                <TableCell>{product?.categoryId || '-'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
