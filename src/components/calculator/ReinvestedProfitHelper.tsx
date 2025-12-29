import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Calculator, CheckCircle2 } from 'lucide-react';

interface ReinvestedProfitHelperProps {
    onCalculate: (amount: number) => void;
}

export function ReinvestedProfitHelper({ onCalculate }: ReinvestedProfitHelperProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState<string>('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['TECH_EQUIPMENT']);

    const toggleCategory = (value: string) => {
        setSelectedCategories(prev =>
            prev.includes(value)
                ? prev.filter(c => c !== value)
                : [...prev, value]
        );
    };

    const handleCalculate = useCallback(() => {
        const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
        onCalculate(numericAmount);
        setOpen(false);
    }, [amount, onCalculate]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 -mt-1 p-0 hover:bg-transparent">
                    <Calculator className="w-3 h-3 mr-1" />
                    Asistent Art. 22
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Profit Reinvestit (Art. 22 Cod Fiscal)</DialogTitle>
                    <DialogDescription>
                        Bifează categoriile de active achiziționate pentru a aplica scutirea de impozit (se pot selecta mai multe):
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    <div className="grid gap-2">
                        <div className="flex flex-col space-y-2">
                            <div
                                className={`flex items-start space-x-2 border p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer ${selectedCategories.includes('TECH_EQUIPMENT') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                onClick={() => toggleCategory('TECH_EQUIPMENT')}
                            >
                                <Checkbox id="c1" checked={selectedCategories.includes('TECH_EQUIPMENT')} onCheckedChange={() => toggleCategory('TECH_EQUIPMENT')} className="mt-1" />
                                <div className="grid gap-0.5">
                                    <Label htmlFor="c1" className="font-semibold cursor-pointer">Echipamente Tehnologice</Label>
                                    <span className="text-xs text-slate-500">Mașini, utilaje și instalații de lucru (Subgrupa 2.1).</span>
                                </div>
                            </div>

                            <div
                                className={`flex items-start space-x-2 border p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer ${selectedCategories.includes('COMPUTERS') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                onClick={() => toggleCategory('COMPUTERS')}
                            >
                                <Checkbox id="c2" checked={selectedCategories.includes('COMPUTERS')} onCheckedChange={() => toggleCategory('COMPUTERS')} className="mt-1" />
                                <div className="grid gap-0.5">
                                    <Label htmlFor="c2" className="font-semibold cursor-pointer">Calculatoare & Periferice</Label>
                                    <span className="text-xs text-slate-500">Calculatoare electronice și echipamente periferice (Clasa 2.2.9).</span>
                                </div>
                            </div>

                            <div
                                className={`flex items-start space-x-2 border p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer ${selectedCategories.includes('SOFTWARE') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                onClick={() => toggleCategory('SOFTWARE')}
                            >
                                <Checkbox id="c3" checked={selectedCategories.includes('SOFTWARE')} onCheckedChange={() => toggleCategory('SOFTWARE')} className="mt-1" />
                                <div className="grid gap-0.5">
                                    <Label htmlFor="c3" className="font-semibold cursor-pointer">Software & Licențe</Label>
                                    <span className="text-xs text-slate-500">Programe informatice achiziționate sau produse (Grupa 2).</span>
                                </div>
                            </div>

                            <div
                                className={`flex items-start space-x-2 border p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer ${selectedCategories.includes('OTHER') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                onClick={() => toggleCategory('OTHER')}
                            >
                                <Checkbox id="c4" checked={selectedCategories.includes('OTHER')} onCheckedChange={() => toggleCategory('OTHER')} className="mt-1" />
                                <div className="grid gap-0.5">
                                    <Label htmlFor="c4" className="font-semibold cursor-pointer">Altele (Producție/Retehnologizare)</Label>
                                    <span className="text-xs text-slate-500">Active utilizate în producție, procesare sau retehnologizare.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2 mt-2">
                        <Label htmlFor="inv_amount">Valoare Totală Investiție (RON)</Label>
                        <Input
                            id="inv_amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ex: 5000"
                        />
                        <p className="text-[11px] text-slate-500">
                            * Scutirea se acordă în limita impozitului pe profit calculat cumulat.
                        </p>
                    </div>

                    {amount && selectedCategories.length > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm border border-green-100 dark:border-green-800">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-semibold text-green-800 dark:text-green-300">Active Eligibile!</span>
                                <p className="text-green-700 dark:text-green-400 mt-1 text-xs">
                                    Ați selectat {selectedCategories.length} categorii. Suma de <span className="font-bold">{amount} RON</span> va fi scutită de impozitul pe profit.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handleCalculate} disabled={!amount || selectedCategories.length === 0}>Aplică Scutirea</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
