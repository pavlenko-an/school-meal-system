export default function OrderSummary({ totalPrice }: { totalPrice: number }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center py-6 px-6 bg-muted/40 rounded-xl border">
      <span className="text-xl font-semibold">Загальна сума замовлення:</span>
      <span className="text-3xl font-bold text-primary mt-2 sm:mt-0">
        {totalPrice.toFixed(2)} грн
      </span>
    </div>
  );
}
