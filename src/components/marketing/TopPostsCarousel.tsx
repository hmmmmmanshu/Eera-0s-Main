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

const topPosts = [
  {
    id: 1,
    platform: "LinkedIn",
    preview: "Just launched our new feature! Here's what makes it different...",
    impressions: 2453,
    likes: 142,
    comments: 28,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    platform: "Instagram",
    preview: "Behind the scenes of building a startup 🚀",
    impressions: 1876,
    likes: 98,
    comments: 15,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    platform: "LinkedIn",
    preview: "5 lessons I learned in my first year as a founder...",
    impressions: 3201,
    likes: 187,
    comments: 42,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    platform: "Instagram",
    preview: "Product update: What we shipped this week ✨",
    impressions: 1543,
    likes: 76,
    comments: 12,
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
  },
];

export const TopPostsCarousel = () => {
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
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={post.image} 
                      alt="Post preview"
                      className="object-cover w-full h-full"
                    />
                    <Badge className="absolute top-2 right-2">
                      {post.platform}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm line-clamp-2">{post.preview}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.impressions.toLocaleString()}
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
