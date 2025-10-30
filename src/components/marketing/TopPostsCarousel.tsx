import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, MessageCircle } from "lucide-react";
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
  const { data: posts = [], isLoading } = useMarketingPosts(platform, "published");

  // Sort by engagement (likes + comments) and take top posts
  const topPosts = [...posts]
    .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
    .slice(0, 6);

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
            {topPosts.map((post) => (
              <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden">
                  {post.media_urls && post.media_urls.length > 0 && (
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                        src={post.media_urls[0]} 
                      alt="Post preview"
                      className="object-cover w-full h-full"
                    />
                      <Badge className="absolute top-2 right-2 capitalize">
                      {post.platform}
                    </Badge>
                  </div>
                  )}
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm line-clamp-2">{post.content}</p>
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
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
};
