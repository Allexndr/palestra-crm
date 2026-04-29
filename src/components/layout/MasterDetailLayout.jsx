import React from 'react';

/**
 * Reusable Master-Detail layout for tablet/desktop efficiency.
 * On mobile (< 600px): Stacks Master and Detail vertically or hides one.
 * On tablet/desktop (> 601px): Shows Master (list) and Detail (item) side-by-side.
 */
export const MasterDetailLayout = ({ 
  master, 
  detail, 
  showDetail = false, 
  onBack = null,
  masterWidth = '350px'
}) => {
  return (
    <div className="md-layout">
      {/* Master View (List) */}
      <div 
        className={`md-master ${showDetail ? 'md-master--hidden-mobile' : ''}`}
        style={{ '--master-width': masterWidth }}
      >
        {master}
      </div>

      {/* Detail View (Content) */}
      <div className={`md-detail ${!showDetail ? 'md-detail--hidden-mobile' : ''}`}>
        {showDetail && onBack && (
          <button 
            onClick={onBack}
            className="md-back-btn mobile-only touch-target"
            aria-label="Назад к списку"
          >
            ← Назад
          </button>
        )}
        {detail || (
          <div className="md-placeholder desktop-only">
            <p>Выберите элемент из списка слева</p>
          </div>
        )}
      </div>

      <style>{`
        .md-layout {
          display: flex;
          height: calc(100vh - 150px);
          background: var(--color-bg);
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
        }

        .md-master {
          width: var(--master-width);
          border-right: 1px solid var(--color-border);
          background: white;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .md-detail {
          flex: 1;
          background: var(--color-bg-secondary);
          overflow-y: auto;
          position: relative;
        }

        .md-placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .md-back-btn {
          position: sticky;
          top: var(--space-4);
          left: var(--space-4);
          z-index: 10;
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 0 var(--space-4);
          font-weight: 700;
          box-shadow: var(--shadow-sm);
        }

        @media (max-width: 600px) {
          .md-layout {
            height: auto;
            border: none;
            box-shadow: none;
            border-radius: 0;
            background: transparent;
          }
          .md-master, .md-detail {
            width: 100% !important;
            border: none;
          }
          .md-master--hidden-mobile {
            display: none;
          }
          .md-detail--hidden-mobile {
            display: none;
          }
        }

        @media (min-width: 601px) and (max-width: 1024px) {
          .md-master {
            width: 300px;
          }
        }
      `}</style>
    </div>
  );
};
