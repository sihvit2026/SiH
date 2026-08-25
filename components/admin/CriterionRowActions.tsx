'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface CriterionRowActionsProps {
    criterionId: string;
}

export const CriterionRowActions: React.FC<
    CriterionRowActionsProps
> = ({ criterionId }) => {
    const handleEdit = () => {
        window.dispatchEvent(
            new CustomEvent('edit-criterion', {
                detail: criterionId,
            })
        );
    };

    const handleDelete = () => {
        window.dispatchEvent(
            new CustomEvent('delete-criterion', {
                detail: criterionId,
            })
        );
    };

    return (
        <div className="flex items-center justify-end gap-2">
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