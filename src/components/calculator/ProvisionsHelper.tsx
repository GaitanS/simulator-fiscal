import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Calculator } from 'lucide-react';

interface ProvisionsHelperProps {
    onCalculate: (deductibleAmount: number) => void;
}

export function ProvisionsHelper({ onCalculate }: ProvisionsHelperProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState<string>('');
    const [type, setType] = useState<'270_DAYS' | 'BANKRUPTCY'>('270_DAYS');

    const handleCalculate = useCallback(() => {
        const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
        let deductible = 0;

        if (type === '270_DAYS') {
            deductible = numericAmount * 0.30;
        } else {
            deductible = numericAmount * 1.00;
        }

        onCalculate(deductible);
        setOpen(false);
    }, [amount, type, onCalculate]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 -mt-1 p-0 hover:bg-transparent">
                    <Calculator className="w-3 h-3 mr-1" />
                    Calculează automat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Calculator Provizioane</DialogTitle>
                    <DialogDescription>
                        Calculează suma deductibilă pentru creanțe neîncasate conform Codului Fiscal.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Valoare Creanță Neîncasată (RON)</Label>
                        <Input
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ex: 10000"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Motivul Neîncasării</Label>
                        <RadioGroup
                            value={type}
                            onValueChange={(val) => setType(val as '270_DAYS' | 'BANKRUPTCY')}
                            className="flex flex-col space-y-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="270_DAYS" id="r1" />
                                <Label htmlFor="r1" className="font-normal">Restantă de peste 270 zile (30% deductibil)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="BANKRUPTCY" id="r2" />
                                <Label htmlFor="r2" className="font-normal">Debitor în faliment/insolvență (100% deductibil)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {amount && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm">
                            <span className="text-slate-500">Suma deductibilă calculată:</span>
                            <div className="font-bold text-lg text-slate-900 dark:text-white mt-1">
                                {type === '270_DAYS'
                                    ? Math.round((parseFloat(amount) || 0) * 0.3)
                                    : Math.round(parseFloat(amount) || 0)
                                } RON
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handleCalculate} disabled={!amount}>Aplică Deducerea</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
