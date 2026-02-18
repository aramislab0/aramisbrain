import PlaybookForm from '@/components/PlaybookForm';

export default function NewPlaybookPage() {
    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        📚 Nouveau Playbook
                    </h1>
                    <p className="text-text-secondary">
                        Créez un nouveau playbook d'automatisation
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-obsidian border border-border rounded-card p-8">
                    <PlaybookForm mode="create" />
                </div>
            </div>
        </div>
    );
}
