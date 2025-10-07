import aiController from '../controllers/ai';

export default [
  {
    method: 'POST',
    path: '/ai',
    handler: aiController.generate,
    config: { auth: false },
  },
];
