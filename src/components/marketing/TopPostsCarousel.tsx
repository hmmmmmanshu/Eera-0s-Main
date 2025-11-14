import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, MessageCircle, FileText } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useMarketingPosts, type Platform } from "@/hooks/useMarketingData";

interface TopPostsCarouselProps {
  platform?: Platform;
}

export const TopPostsCarousel = ({ platform }: TopPostsCarouselProps) => {
  // Normalize platform for filtering (ensure lowercase)
  const normalizedPlatform = platform 
    ? (platform.toLowerCase() as "linkedin" | "instagram" | "twitter" | "facebook")
    : undefined;
  
  const { data: posts = [], isLoading } = useMarketingPosts(normalizedPlatform, "published");

  // Sort by engagement (likes + comments) and take top posts
  const topPosts = [...posts]
    .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
    .slice(0, 6);
  
  // Debug logging (commented out for production)
  // console.log("[TopPostsCarousel] Platform filter:", normalizedPlatform);
  // console.log("[TopPostsCarousel] Posts found:", posts.length);
  // console.log("[TopPostsCarousel] Top posts:", topPosts.length);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading posts...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No published posts yet. Create your first post to see it here!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full">
          <CarouselContent>
            {topPosts.map((post) => {
              // Priority: final_image_url > selected_image_url > media_urls[0]
              const finalImageUrl = (post as any).final_image_url;
              const selectedImageUrl = (post as any).selected_image_url;
              const mediaUrl = post.media_urls && Array.isArray(post.media_urls) && post.media_urls.length > 0 
                ? post.media_urls[0] 
                : null;
              const imageUrl = finalImageUrl || selectedImageUrl || mediaUrl;
              
              return (
                <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden">
                    {imageUrl ? (
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={imageUrl as string} 
                          alt="Post preview"
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            console.error("[TopPostsCarousel] Image load error:", imageUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <Badge className="absolute top-2 right-2 capitalize">
                          {post.platform}
                        </Badge>
                      </div>
                    ) : (
                      <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
                        <Badge className="absolute top-2 right-2 capitalize">
                          {post.platform}
                        </Badge>
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm line-clamp-2">{post.content || "No caption"}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {post.comments}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
};
