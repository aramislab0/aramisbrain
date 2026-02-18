'use client';

import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface RiskRadarChartProps {
    technical: number;
    administrative: number;
    financial: number;
    dispersion: number;
}

export function RiskRadarChart({
    technical,
    administrative,
    financial,
    dispersion
}: RiskRadarChartProps) {
    const data = {
        labels: ['Technique', 'Administratif', 'Financier', 'Dispersion'],
        datasets: [
            {
                label: 'Niveau de Risque',
                data: [technical, administrative, financial, dispersion],
                backgroundColor: 'rgba(212, 175, 55, 0.2)', // Gold Aramis 20% opacity
                borderColor: '#D4AF37', // Gold Aramis
                borderWidth: 2,
                pointBackgroundColor: '#D4AF37',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#D4AF37',
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            r: {
                beginAtZero: true,
                max: 10,
                ticks: {
                    stepSize: 2,
                    color: '#9CA3AF', // text-secondary
                    backdropColor: 'transparent'
                },
                grid: {
                    color: '#27272A', // border color
                },
                pointLabels: {
                    color: '#FFFFFF', // text-primary
                    font: {
                        size: 14,
                        weight: '600' as const
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#1A1A1A',
                titleColor: '#D4AF37',
                bodyColor: '#FFFFFF',
                borderColor: '#D4AF37',
                borderWidth: 1,
                callbacks: {
                    label: (context: any) => {
                        const value = context.parsed.r;
                        let level = 'Faible';
                        if (value > 7) level = 'Critique';
                        else if (value > 5) level = 'Élevé';
                        else if (value > 3) level = 'Moyen';

                        return `${context.label}: ${value.toFixed(1)}/10 (${level})`;
                    }
                }
            }
        }
    };

    return (
        <div className="bg-bg-secondary border border-gold-primary/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-6">⚠️ Radar de Risques</h2>
            <div className="max-w-lg mx-auto">
                <Radar data={data} options={options} />
            </div>

            {/* Légende */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                    { label: 'Technique', value: technical },
                    { label: 'Administratif', value: administrative },
                    { label: 'Financier', value: financial },
                    { label: 'Dispersion', value: dispersion }
                ].map(item => (
                    <div key={item.label} className="bg-bg-primary rounded p-3">
                        <p className="text-xs text-text-secondary mb-1">{item.label}</p>
                        <p className={`text-2xl font-bold ${item.value > 7 ? 'text-risk-critical' :
                                item.value > 5 ? 'text-risk-high' :
                                    item.value > 3 ? 'text-risk-medium' :
                                        'text-risk-low'
                            }`}>
                            {item.value.toFixed(1)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
