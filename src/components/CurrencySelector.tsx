
import { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign } from 'lucide-react';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Exchange rate relative to USD
}

// Common currencies with their symbols and exchange rates (as of May 2025)
const defaultCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.93 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.8 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.35 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.45 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 75.5 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.1 },
];

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const CurrencySelector = ({ selectedCurrency, onCurrencyChange }: CurrencySelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <DollarSign className="text-gray-500" size={16} />
      <Select
        value={selectedCurrency.code}
        onValueChange={(value) => {
          const currency = defaultCurrencies.find(c => c.code === value);
          if (currency) {
            onCurrencyChange(currency);
          }
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {defaultCurrencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              {currency.symbol} {currency.name} ({currency.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { CurrencySelector, defaultCurrencies };
