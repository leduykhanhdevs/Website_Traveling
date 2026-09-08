import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';

test('planner UI: seven days, save/restore, export, malformed response and offline failure', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage, HTMLElement: dom.window.HTMLElement });
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  const { render, fireEvent, waitFor, cleanup } = await import('@testing-library/react');
  const { ItineraryPlanner } = await import('../src/components/home/ItineraryPlanner');
  const { AuthModal } = await import('../src/components/home/AuthModal');
  const realFetch = globalThis.fetch;
  const realCreateURL = URL.createObjectURL, realRevokeURL = URL.revokeObjectURL;
  const plan = {
    id: 'ui-test-plan', destination: 'Tokyo, Nhật Bản', budgetRange: 'midrange', totalEstimatedSpend: 70,
    days: Array.from({ length: 7 }, (_, index) => ({ day: index + 1, title: `Ngày kiểm thử ${index + 1}`, totalEstimatedSpend: 10,
      slots: [{ id: `slot-${index}`, day: index + 1, startTime: '09:00', endTime: '10:00', title: `Điểm kiểm thử ${index + 1}`, description: 'Dữ liệu chỉ dùng trong bài kiểm thử tự động.', estimatedSpend: 10 }],
    })),
  };
  const props = { destinationId: 'tokyo', onDestinationChange: () => {} };
  let downloadName = '', exported: Blob | undefined;
  URL.createObjectURL = (blob) => { exported = blob as Blob; return 'blob:test-only'; };
  URL.revokeObjectURL = () => {};
  dom.window.HTMLAnchorElement.prototype.click = function () { downloadName = this.download; };
  try {
    globalThis.fetch = async (_url, options) => {
      const request = JSON.parse(String(options?.body));
      assert.equal(request.days, 7); assert.equal(request.destination, 'Tokyo, Nhật Bản');
      return new Response(JSON.stringify({ plan }));
    };
    let view = render(React.createElement(ItineraryPlanner, props));
    fireEvent.click(view.getByRole('button', { name: '7 ngày' }));
    fireEvent.click(view.getByRole('button', { name: 'Tạo lịch trình AI' }));
    await waitFor(() => assert.ok(view.getByRole('button', { name: 'Ngày 7' })));
    fireEvent.click(view.getByRole('button', { name: 'Ngày 7' }));
    assert.ok(view.getByRole('heading', { name: 'Điểm kiểm thử 7' }));
    fireEvent.click(view.getByRole('button', { name: 'Lưu trên thiết bị' }));
    assert.equal(JSON.parse(localStorage.getItem('traveling:itinerary:v1')!).days.length, 7);
    fireEvent.click(view.getByRole('button', { name: 'Xuất JSON' }));
    assert.equal(downloadName, 'traveling-ui-test-plan.json');
    assert.equal(JSON.parse(await exported!.text()).destination, plan.destination);
    fireEvent.click(view.getByRole('button', { name: 'Tải lịch ngoại tuyến' }));
    assert.match(await exported!.text(), /NGÀY 7/);
    view.unmount();
    view = render(React.createElement(ItineraryPlanner, props));
    await waitFor(() => assert.ok(view.getByText('Đã khôi phục lịch lưu trên thiết bị này.')));
    globalThis.fetch = async () => new Response('{"plan":{}}');
    fireEvent.click(view.getByRole('button', { name: 'Tạo lịch trình AI' }));
    await waitFor(() => assert.ok(view.getByRole('alert')));
    assert.ok(view.getByRole('heading', { name: plan.destination }));
    globalThis.fetch = async () => { throw new TypeError('Network unavailable'); };
    fireEvent.click(view.getByRole('button', { name: 'Tạo lịch trình AI' }));
    await waitFor(() => assert.match(view.getByRole('alert').textContent || '', /Kết nối bị gián đoạn/));
    assert.ok(view.getByRole('button', { name: 'Ngày 7' }));
    view.unmount();
    // A rejected email request must never become a success screen.
    globalThis.fetch = async () => new Response('{"error":"Service unavailable"}', { status: 503 });
    const modal = render(React.createElement(AuthModal, { isOpen: true, onClose: () => {} }));
    fireEvent.change(modal.getByRole('textbox'), { target: { value: 'test@example.com' } });
    fireEvent.submit(modal.container.querySelector('form')!);
    await waitFor(() => assert.match(modal.getByRole('alert').textContent || '', /Service unavailable/));
    assert.equal(modal.queryByText('Yêu cầu gửi thư đã được tiếp nhận!'), null);
  } finally {
    cleanup(); globalThis.fetch = realFetch; URL.createObjectURL = realCreateURL; URL.revokeObjectURL = realRevokeURL; dom.window.close();
  }
});
