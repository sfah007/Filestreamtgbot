/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UploadPage } from './pages/UploadPage';
import { FilePage } from './pages/FilePage';
import { AdminPage } from './pages/AdminPage';
import { DocsPage } from './pages/DocsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/file/:id" element={<FilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
