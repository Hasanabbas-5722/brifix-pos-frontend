"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/lib/types";

interface ReceiptModalProps {
    onClose: () => void;
    items: CartItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: string;
    amountPaid?: number;
    change?: number;
    date: Date;
    orderNumber: string;
}

export function ReceiptModal({
    onClose,
    items,
    subtotal,
    tax,
    discount,
    total,
    paymentMethod,
    amountPaid,
    change,
    date,
    orderNumber,
}: ReceiptModalProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60] print:bg-white print:backdrop-blur-none" onClick={onClose}>
            <div 
                className="bg-card w-full max-w-sm mx-4 bg-white text-black print:shadow-none print:m-0 print:max-w-full shadow-2xl rounded-2xl overflow-hidden" 
                onClick={e => e.stopPropagation()}
            >
                {/* Print-only View / Receipt Content */}
                <div className="p-6 receipt-content">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold uppercase tracking-wider">Brifix POS</h2>
                        <p className="text-sm text-gray-500 mt-1">123 Business Street, Tech City</p>
                        <p className="text-sm text-gray-500">+1 234 567 8900</p>
                    </div>

                    <div className="border-b border-dashed border-gray-300 pb-4 mb-4 text-sm font-mono flex justify-between">
                        <div>
                            <p>Date: {date.toLocaleDateString()}</p>
                            <p>Time: {date.toLocaleTimeString()}</p>
                        </div>
                        <div className="text-right">
                            <p>Order: #{orderNumber}</p>
                            <p>Cashier: Admin</p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6 font-mono text-sm max-h-[300px] overflow-y-auto print:max-h-none scrollbar-thin scrollbar-thumb-gray-300">
                        {items.map((item, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.product.name}</p>
                                    <p className="text-gray-500">{item.quantity} x {formatCurrency(item.product.price)}</p>
                                </div>
                                <div className="font-medium text-gray-900 text-right">
                                    {formatCurrency(item.quantity * item.product.price)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-gray-300 pt-4 space-y-2 font-mono text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <span>Discount</span>
                                <span>-{formatCurrency(discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-600">
                            <span>Tax (8.5%)</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2 text-gray-900">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-gray-300 mt-4 pt-4 font-mono text-sm space-y-1">
                        <div className="flex justify-between text-gray-600">
                            <span>Payment Method</span>
                            <span className="uppercase">{paymentMethod}</span>
                        </div>
                        {amountPaid !== undefined && amountPaid > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <span>Amount Paid</span>
                                <span>{formatCurrency(amountPaid)}</span>
                            </div>
                        )}
                        {change !== undefined && change > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <span>Change</span>
                                <span>{formatCurrency(change)}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-8 font-mono text-xs text-gray-500 space-y-1">
                        <p>Thank you for your purchase!</p>
                        <p>Please come again.</p>
                    </div>
                </div>

                {/* Actions (Hidden in Print) */}
                <div className="p-4 bg-muted/30 border-t border-gray-200 flex gap-3 print:hidden">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                        Print Receipt
                    </button>
                </div>
            </div>
            
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .receipt-content, .receipt-content * {
                        visibility: visible;
                    }
                    .receipt-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
