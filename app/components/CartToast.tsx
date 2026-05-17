"use client";

type CartToastProps = {
  message: string;
};

export default function CartToast({ message }: CartToastProps) {
  if (!message) return null;

  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <strong>Added to cart</strong>
      <span>{message}</span>
    </div>
  );
}
