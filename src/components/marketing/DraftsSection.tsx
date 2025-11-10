import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Send, Eye, CheckCircle } from "lucide-react";
import { useMarketingPosts, useUpdatePost, useDeletePost } from "@/hooks/useMarketingData";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const DraftsSection = () => {
  const { data: allDrafts = [], isLoading } = useMarketingPosts(undefined, "draft");
  const { data: generatingPosts = [] } = useMarketingPosts(undefined, "generating");
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
            <div className="space-y-4">
              {drafts.map((draft) => (
              <Card key={draft.id} className="overflow-hidden hover:border-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Thumbnail - Show first generated image or final image */}
                    {(() => {
                      const imageUrl = (draft as any).final_image_url || 
                                      ((draft as any).generated_images && Array.isArray((draft as any).generated_images) && (draft as any).generated_images.length > 0 
                                        ? (draft as any).generated_images[0] 
                                        : draft.media_urls && Array.isArray(draft.media_urls) && draft.media_urls.length > 0 
                                          ? draft.media_urls[0] 
                                          : null);
                      
                      return imageUrl ? (
                        <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          <img
                            src={imageUrl as string}
                            alt="Draft preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error("[DraftsSection] Image load error:", imageUrl);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      );
                    })()}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge className="capitalize">{draft.platform}</Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewPost(draft)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handlePublish(draft.id)}
                            disabled={updatePostMutation.isPending}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(draft.id)}
                            disabled={deletePostMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm line-clamp-3 mb-2">
                        {draft.content}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(draft.created_at).toLocaleDateString()}
                        {(draft as any).generated_images && Array.isArray((draft as any).generated_images) && (
                          <span className="ml-2">
                            • {(draft as any).generated_images.length} image{(draft as any).generated_images.length !== 1 ? 's' : ''} generated
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
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
            <div className="space-y-4">
              {ready.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:border-green-500/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      {(() => {
                        const imageUrl = (post as any).final_image_url || 
                                        (post.media_urls && Array.isArray(post.media_urls) && post.media_urls.length > 0 
                                          ? post.media_urls[0] 
                                          : null);
                        
                        return imageUrl ? (
                          <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
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
                          <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        );
                      })()}
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge className="capitalize">{post.platform}</Badge>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            Ready
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPreviewPost(post)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handlePublish(post.id)}
                              disabled={updatePostMutation.isPending}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Publish
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(post.id)}
                              disabled={deletePostMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm line-clamp-3 mb-2">
                          {post.content}
                        </p>
                        
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewPost} onOpenChange={() => setPreviewPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Draft Preview</DialogTitle>
          </DialogHeader>
          
          {previewPost && (
            <div className="space-y-4">
              <Badge className="capitalize">{previewPost.platform}</Badge>
              
              {previewPost.media_urls && Array.isArray(previewPost.media_urls) && previewPost.media_urls.length > 0 && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={previewPost.media_urls[0] as string}
                    alt="Post preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("[DraftsSection Preview] Image load error:", previewPost.media_urls[0]);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="whitespace-pre-wrap">{previewPost.content}</p>
              </div>
              
              <div className="flex gap-2 justify-end">
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

