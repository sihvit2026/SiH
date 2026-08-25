'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface EvaluatorRowActionsProps {
    evaluatorId: string;
}

export const EvaluatorRowActions: React.FC<
    EvaluatorRowActionsProps
> = ({ evaluatorId }) => {
    const handleEdit = () => {
        window.dispatchEvent(
            new CustomEvent('edit-evaluator', {
                detail: evaluatorId,
            })
        );
    };

    const handleDelete = () => {
        window.dispatchEvent(
            new CustomEvent('delete-evaluator', {
                detail: evaluatorId,
            })
        );
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleEdit}
            >
                Edit
            </Button>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
            >
                Delete
            </Button>
        </div>
    );
};