<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use League\CommonMark\CommonMarkConverter;
class PostDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $converter = new CommonMarkConverter([
            'html_input' => 'strip', // Tùy chọn bảo mật: loại bỏ các thẻ HTML trong Markdown
            'allow_unsafe_links' => false,
        ]);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $converter->convert($this->content)->getContent(),
            'created_at' => $this->created_at->toDateTimeString(),
            'likes_count' => $this->likes_count,
            'comments_count' => $this->comments_count,
            'is_liked' => $this->is_liked ?? false,
            'status' => $this->status,
            'topic' => [
                'title' => $this->topic->title,
            ],
            'author' => new UserPostDetailResource($this->whenLoaded('user')),
            'comments' => CommentResource::collection($this->whenLoaded('rootComments')),
        ];
    }
}
