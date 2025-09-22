'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { suggestParkingRate, type SuggestParkingRateOutput } from '@/ai/flows/suggest-parking-rate';
import { Bot, Lightbulb } from 'lucide-react';

const formSchema = z.object({
  entryTime: z.string().datetime({ message: 'Por favor, ingresa una fecha y hora válidas.' }),
  durationHours: z.coerce.number().min(0.1, { message: 'La duración debe ser de al menos 0.1 horas.' }),
  historicalData: z.string().min(10, { message: 'Por favor, proporciona algunos datos históricos.' }),
});

const defaultHistoricalData = `
- Lunes 9 AM, 2 horas, $5.00
- Lunes 2 PM, 1 hora, $2.50
- Martes 9 AM, 8 horas, $20.00
- Viernes 6 PM, 3 horas, $10.00 (recargo por evento)
- Sábado 1 PM, 4 horas, $10.00
`.trim();

export default function RateSuggesterForm() {
  const [suggestion, setSuggestion] = useState<SuggestParkingRateOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryTime: new Date().toISOString().slice(0, 16),
      durationHours: 1,
      historicalData: defaultHistoricalData,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const result = await suggestParkingRate({
        ...values,
        entryTime: new Date(values.entryTime).toISOString(),
      });
      setSuggestion(result);
    } catch (e: any) {
      setError('Ocurrió un error al obtener la sugerencia.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <FormField
                        control={form.control}
                        name="entryTime"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Hora de Entrada</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="durationHours"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Duración del Estacionamiento (horas)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="historicalData"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Datos Históricos</FormLabel>
                            <FormControl>
                                <Textarea rows={6} placeholder="Proporciona algunos datos históricos de estacionamiento..." {...field} />
                            </FormControl>
                            <FormDescription>
                                Proporciona ejemplos de sesiones de estacionamiento pasadas para mejorar la precisión.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </CardContent>
                <CardFooter>
                     <Button type="submit" disabled={isLoading}>
                        <Bot className="mr-2 h-4 w-4" />
                        {isLoading ? 'Pensando...' : 'Obtener Sugerencia'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
      </Form>

      {suggestion && (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-accent" /> Sugerencia de la IA
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Tarifa Sugerida</p>
                    <p className="text-4xl font-bold text-primary">${suggestion.suggestedRate.toFixed(2)}</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-1">Razonamiento</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{suggestion.reasoning}</p>
                </div>
            </CardContent>
        </Card>
      )}
      {error && <p className="text-destructive">{error}</p>}
    </div>
  );
}
