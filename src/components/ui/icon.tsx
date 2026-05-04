import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
  fallback?: string;
}

const Icon: React.FC<IconProps> = ({ name, fallback = 'CircleAlert', ...props }) => {
  const IconComponent = (LucideIcons as Record<string, React.FC<LucideProps>>)[name];

  if (!IconComponent) {
    // ÐÑÐ»Ð¸ Ð¸ÐºÐ¾Ð½ÐºÐ° Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð°, Ð¸ÑÐ¿Ð¾Ð»ÑÐ·ÑÐµÐ¼ fallback Ð¸ÐºÐ¾Ð½ÐºÑ
    const FallbackIcon = (LucideIcons as Record<string, React.FC<LucideProps>>)[fallback];

    // ÐÑÐ»Ð¸ Ð´Ð°Ð¶Ðµ fallback Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½, Ð²Ð¾Ð·Ð²ÑÐ°ÑÐ°ÐµÐ¼ Ð¿ÑÑÑÐ¾Ð¹ span
    if (!FallbackIcon) {
      return <span className="text-xs text-gray-400">[icon]</span>;
    }

    return <FallbackIcon {...props} />;
  }

  return <IconComponent {...props} />;
};

export default Icon;
