import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Trash2, Send, Eye, CheckCircle, Download } from "lucide-react";
import { useMarketingPosts, useUpdatePost, useDeletePost } from "@/hooks/useMarketingData";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface DraftsSectionProps {
  platform?: "linkedin" | "instagram" | "all";
}

export const DraftsSection = ({ platform }: DraftsSectionProps) => {
  // Filter by platform if specified (excluding "all")
  // Normalize platform to lowercase for consistent filtering
  const platformFilter = platform && platform !== "all" 
    ? (platform.toLowerCase() as "linkedin" | "instagram" | "twitter" | "facebook")
    : undefined;
  
  const { data: allDrafts = [], isLoading } = useMarketingPosts(platformFilter, "draft");
  const { data: generatingPosts = [] } = useMarketingPosts(platformFilter, "generating");
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();
  
  const [previewPost, setPreviewPost] = useState<typeof allDrafts[0] | null>(null);
  
  // Separate drafts into "Drafts" (in progress) and "Ready" (finalized)
  const drafts = [...allDrafts, ...generatingPosts].filter(post => {
    // Drafts: posts without final_image_url or still generating
    return !(post as any).final_image_url || (post as any).status === "generating";
  });
  
  const ready = allDrafts.filter(post => {
    // Ready: posts with final_image_url set (finalized but not published)
    return !!(post as any).final_image_url && (post as any).status !== "generating";
  });

  const handlePublish = async (id: string) => {
    try {
      await updatePostMutation.mutateAsync({
        id,
        updates: {
          status: "published",
          published_time: new Date().toISOString(),
        },
      });
      toast.success("Post published successfully!");
    } catch (error) {
      console.error("Publish failed:", error);
      toast.error("Failed to publish post");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    
    try {
      await deletePostMutation.mutateAsync(id);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Drafts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading drafts...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Drafts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Drafts ({drafts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No drafts in progress. Create your first post to see it here!
            </div>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {drafts.map((draft) => (
                  <CarouselItem key={draft.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="overflow-hidden hover:border-accent/50 transition-colors h-full">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          {/* Image Carousel - Show all generated images */}
                          {(() => {
                            const generatedImages = (draft as any).generated_images && Array.isArray((draft as any).generated_images) 
                              ? (draft as any).generated_images 
                              : [];
                            const finalImage = (draft as any).final_image_url;
                            const imagesToShow = finalImage 
                              ? [finalImage, ...generatedImages.filter((url: string) => url !== finalImage)]
                              : generatedImages.length > 0 
                                ? generatedImages 
                                : draft.media_urls && Array.isArray(draft.media_urls) && draft.media_urls.length > 0
                                  ? draft.media_urls
                                  : [];
                            
                            if (imagesToShow.length === 0) {
                              return (
                                <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                                  <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                              );
                            }
                            
                            // Show carousel if multiple images, single image if one
                            if (imagesToShow.length > 1) {
                              return (
                                <Carousel className="w-full">
                                  <CarouselContent>
                                    {imagesToShow.slice(0, 3).map((imageUrl: string, idx: number) => (
                                      <CarouselItem key={idx}>
                                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted">
                                          <img
                                            src={imageUrl}
                                            alt={`Generated image ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              console.error("[DraftsSection] Image load error:", imageUrl);
                                              e.currentTarget.style.display = 'none';
                                            }}
                                          />
                                        </div>
                                      </CarouselItem>
                                    ))}
                                  </CarouselContent>
                                  {imagesToShow.length > 1 && (
                                    <>
                                      <CarouselPrevious className="h-6 w-6 -left-2" />
                                      <CarouselNext className="h-6 w-6 -right-2" />
                                    </>
                                  )}
                                </Carousel>
                              );
                            }
                            
                            return (
                              <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={imagesToShow[0]}
                                  alt="Draft preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error("[DraftsSection] Image load error:", imagesToShow[0]);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            );
                          })()}
                    
                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <Badge className="capitalize text-xs">{draft.platform}</Badge>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => setPreviewPost(draft)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7 text-xs px-2"
                                  onClick={() => handlePublish(draft.id)}
                                  disabled={updatePostMutation.isPending}
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Publish
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleDelete(draft.id)}
                                  disabled={deletePostMutation.isPending}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-xs line-clamp-2">
                              {draft.content}
                            </p>
                            
                            <p className="text-xs text-muted-foreground">
                              {new Date(draft.created_at).toLocaleDateString()}
                              {(draft as any).generated_images && Array.isArray((draft as any).generated_images) && (
                                <span className="ml-2">
                                  • {(draft as any).generated_images.length} image{(draft as any).generated_images.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </p>
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
          )}
        </CardContent>
      </Card>

      {/* Ready Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-green-500" />
            Ready ({ready.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ready.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No posts ready yet. Finalize a post to see it here!
            </div>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {ready.map((post) => (
                  <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="overflow-hidden hover:border-green-500/50 transition-colors h-full">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          {/* Image - Show final image */}
                          {(() => {
                            // Priority: final_image_url > selected_image_url > media_urls[0]
                            const finalImageUrl = (post as any).final_image_url;
                            const selectedImageUrl = (post as any).selected_image_url;
                            const mediaUrl = post.media_urls && Array.isArray(post.media_urls) && post.media_urls.length > 0 
                              ? post.media_urls[0] 
                              : null;
                            const imageUrl = finalImageUrl || selectedImageUrl || mediaUrl;
                            
                            return imageUrl ? (
                              <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={imageUrl as string}
                                  alt="Post preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error("[DraftsSection Ready] Image load error:", imageUrl);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                              </div>
                            );
                          })()}
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <Badge className="capitalize text-xs">{post.platform}</Badge>
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                                Ready
                              </Badge>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => setPreviewPost(post)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7 text-xs px-2"
                                  onClick={() => handlePublish(post.id)}
                                  disabled={updatePostMutation.isPending}
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Publish
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleDelete(post.id)}
                                  disabled={deletePostMutation.isPending}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-xs line-clamp-2">
                              {post.content}
                            </p>
                            
                            <p className="text-xs text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
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
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewPost} onOpenChange={() => setPreviewPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Draft Preview</DialogTitle>
          </DialogHeader>
          
          {previewPost && (() => {
            // Get the best image to display (final_image_url > selected_image_url > media_urls[0])
            const finalImageUrl = (previewPost as any).final_image_url;
            const selectedImageUrl = (previewPost as any).selected_image_url;
            const mediaUrl = previewPost.media_urls && Array.isArray(previewPost.media_urls) && previewPost.media_urls.length > 0 
              ? previewPost.media_urls[0] 
              : null;
            const imageUrl = finalImageUrl || selectedImageUrl || mediaUrl;
            
            return (
              <div className="space-y-4">
                <Badge className="capitalize">{previewPost.platform}</Badge>
                
                {imageUrl && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted group">
                    <img
                      src={imageUrl as string}
                      alt="Post preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("[DraftsSection Preview] Image load error:", imageUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          try {
                            const response = await fetch(imageUrl as string);
                            const blob = await response.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `post-image-${previewPost.id}.${blob.type.includes('png') ? 'png' : 'jpg'}`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            toast.success("Image downloaded");
                          } catch (error) {
                            console.error("Failed to download image:", error);
                            toast.error("Failed to download image");
                          }
                        }}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download Image
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Caption Section - More Prominent */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Caption</Label>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border min-h-[100px]">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {previewPost.content || "No caption available"}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Download caption as text file
                      const caption = previewPost.content || "";
                      if (!caption) {
                        toast.error("No caption to download");
                        return;
                      }
                      const blob = new Blob([caption], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `post-caption-${previewPost.id}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success("Caption downloaded");
                    }}
                    disabled={!previewPost.content}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Caption
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewPost(null)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handlePublish(previewPost.id);
                      setPreviewPost(null);
                    }}
                    disabled={updatePostMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Publish Now
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
};

