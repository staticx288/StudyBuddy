import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  conversationTitle?: string;
}

interface ExportOptions {
  format: 'markdown' | 'json' | 'txt';
  includeMessages: boolean;
  includeTimestamps: boolean;
  includeModelInfo: boolean;
}

export default function ExportModal({ 
  isOpen, 
  onClose, 
  conversationId, 
  conversationTitle = 'conversation' 
}: ExportModalProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'markdown',
    includeMessages: true,
    includeTimestamps: true,
    includeModelInfo: false,
  });

  const handleExport = async () => {
    if (!conversationId) return;

    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        format: options.format,
        includeTimestamps: options.includeTimestamps.toString(),
        includeModelInfo: options.includeModelInfo.toString(),
      });

      const response = await fetch(`/api/conversations/${conversationId}/export?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Get filename from response headers or create one
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 
        `${conversationTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${options.format === 'txt' ? 'txt' : options.format}`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Conversation exported successfully",
      });
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export conversation",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Conversation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="format" className="text-sm font-medium">
              Export Format
            </Label>
            <Select
              value={options.format}
              onValueChange={(format: 'markdown' | 'json' | 'txt') =>
                setOptions(prev => ({ ...prev, format }))
              }
            >
              <SelectTrigger className="mt-1" data-testid="select-export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markdown">Markdown (.md)</SelectItem>
                <SelectItem value="json">JSON (.json)</SelectItem>
                <SelectItem value="txt">Plain Text (.txt)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Include</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMessages"
                  checked={options.includeMessages}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, includeMessages: checked as boolean }))
                  }
                  disabled // Always include messages
                  data-testid="checkbox-include-messages"
                />
                <Label htmlFor="includeMessages" className="text-sm">
                  Messages
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTimestamps"
                  checked={options.includeTimestamps}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, includeTimestamps: checked as boolean }))
                  }
                  data-testid="checkbox-include-timestamps"
                />
                <Label htmlFor="includeTimestamps" className="text-sm">
                  Timestamps
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeModelInfo"
                  checked={options.includeModelInfo}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, includeModelInfo: checked as boolean }))
                  }
                  data-testid="checkbox-include-model-info"
                />
                <Label htmlFor="includeModelInfo" className="text-sm">
                  Model Information
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
            data-testid="button-export-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !conversationId}
            data-testid="button-export-confirm"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
