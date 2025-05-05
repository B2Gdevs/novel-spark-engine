import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNovel } from '@/contexts/NovelContext';
import { Page } from '@/types/novel';
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function PagesPage() {
  const { currentBook, addPage, deletePage } = useNovel();
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    if (currentBook) {
      setPages(currentBook.pages);
    }
  }, [currentBook]);

  const createPage = () => {
    const timestamp = new Date().toISOString();
    
    const newPage: Omit<Page, 'id'> = {
      title: 'New Page',
      content: '',
      order: currentBook.pages.length,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    addPage(newPage);
    navigate('/pages');
  };

  const handleDeletePage = (pageId: string) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      deletePage(pageId);
    }
  };

  if (!currentBook) {
    return <div>Please select a book first.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Button onClick={createPage}>Create New Page</Button>
      </div>
      {pages.length === 0 ? (
        <div className="text-gray-500">No pages created yet.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>A list of your pages.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.order}</TableCell>
                  <TableCell>
                    <Link to={`/pages/${page.id}`}>{page.title}</Link>
                  </TableCell>
                  <TableCell>{new Date(page.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/pages/${page.id}`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeletePage(page.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
