import express from 'express';
import { 
    createComment, 
    getComments, 
    updateComment, 
    deleteComment 
} from '../controllers/comment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Comment routes
router.post('/issues/:id/comments', protect, createComment);
router.get('/issues/:id/comments', getComments);
router.patch('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);

export default router;
