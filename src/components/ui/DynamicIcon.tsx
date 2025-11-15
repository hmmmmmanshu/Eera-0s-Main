import { useEffect, useState, memo, ComponentType } from "react";
import type { LucideProps } from "lucide-react";

/**
 * Dynamic Icon Component - Loads lucide-react icons on demand
 * 
 * This prevents bundler circular dependency issues by loading icons at runtime
 * instead of at module initialization time.
 * 
 * Features:
 * - In-memory caching for instant re-renders
 * - Preloading support for common icons
 * - Fallback support
 * - TypeScript support with proper types
 * 
 * @example
 * <DynamicIcon name="Send" className="w-4 h-4" />
 * <DynamicIcon name="Trash" size={16} color="red" />
 */

// Global cache for loaded icons - persists across component instances
const iconCache = new Map<string, ComponentType<LucideProps>>();

// Track loading promises to prevent duplicate requests
const loadingPromises = new Map<string, Promise<ComponentType<LucideProps>>>();

interface DynamicIconProps extends LucideProps {
  name: string;
  fallback?: ComponentType<LucideProps>;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Loads an icon from lucide-react dynamically
 */
async function loadIcon(name: string): Promise<ComponentType<LucideProps>> {
  // Return from cache if available
  if (iconCache.has(name)) {
    return iconCache.get(name)!;
  }

  // Return existing loading promise if in progress
  if (loadingPromises.has(name)) {
    return loadingPromises.get(name)!;
  }

  // Start new load
  const loadPromise = import('lucide-react')
    .then((module) => {
      const IconComponent = module[name as keyof typeof module] as ComponentType<LucideProps>;
      
      if (!IconComponent) {
        throw new Error(`Icon "${name}" not found in lucide-react`);
      }

      // Cache the loaded icon
      iconCache.set(name, IconComponent);
      loadingPromises.delete(name);
      
      return IconComponent;
    })
    .catch((error) => {
      loadingPromises.delete(name);
      throw error;
    });

  loadingPromises.set(name, loadPromise);
  return loadPromise;
}

/**
 * Preload icons to prevent flash on first render
 * Call this on app initialization with commonly used icons
 */
export async function preloadIcons(iconNames: string[]): Promise<void> {
  const promises = iconNames.map(name => loadIcon(name).catch(() => null));
  await Promise.all(promises);
}

/**
 * Clear icon cache (useful for testing or memory management)
 */
export function clearIconCache(): void {
  iconCache.clear();
  loadingPromises.clear();
}

/**
 * Check if an icon is cached
 */
export function isIconCached(name: string): boolean {
  return iconCache.has(name);
}

function DynamicIconComponent({ 
  name, 
  fallback, 
  onLoad, 
  onError,
  ...props 
}: DynamicIconProps) {
  const [IconComponent, setIconComponent] = useState<ComponentType<LucideProps> | null>(
    () => iconCache.get(name) || null
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If already cached, no need to load
    if (iconCache.has(name)) {
      const cached = iconCache.get(name)!;
      setIconComponent(cached);
      onLoad?.();
      return;
    }

    let mounted = true;

    loadIcon(name)
      .then((component) => {
        if (mounted) {
          setIconComponent(component);
          onLoad?.();
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          onError?.(err);
          console.error(`Failed to load icon "${name}":`, err);
        }
      });

    return () => {
      mounted = false;
    };
  }, [name, onLoad, onError]);

  // Show fallback if provided and icon failed to load
  if (error && fallback) {
    const FallbackIcon = fallback;
    return <FallbackIcon {...props} />;
  }

  // Show nothing while loading (prevents layout shift)
  if (!IconComponent) {
    return <span className={props.className} style={{ display: 'inline-block', width: props.size || 24, height: props.size || 24 }} />;
  }

  return <IconComponent {...props} />;
}

// Memoize to prevent unnecessary re-renders
export const DynamicIcon = memo(DynamicIconComponent);

// Export type for consumers
export type { DynamicIconProps };

