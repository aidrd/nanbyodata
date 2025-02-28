async function loadTeamMembers() {
  try {
    const response = await fetch('/static/data/members.json');
    const teams = await response.json();
    const locale = document.querySelector('.language-select').value || 'en';

    const contentsWrapper = document.querySelector('.contents-wrapper');
    let html = '';

    // 言語の値を取得する関数（指定言語がない場合は英語を返す）
    const getLocalizedValue = (obj, key) => {
      return obj[key][locale] || obj[key]['en'] || '';
    };

    teams.forEach((team) => {
      html += `
        <div class="team-section">
          <div class="team-box">
            <h3>${team.team}</h3>
            <div class="row">
              ${team.members
                .map(
                  (member, index) => `
                ${
                  index % 3 === 0 && index !== 0
                    ? '</div><div class="row">'
                    : ''
                }
                <div class="col-md-4 mb-4">
                  <div class="member-card text-center">
                    <div class="member-image mb-2">
                      ${
                        member.image_name
                          ? `<img src="/static/img/members/${
                              member.image_name
                            }" 
                            alt="${getLocalizedValue(member, 'name')}"
                            class="rounded-circle"
                            onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fas fa-user-circle\\'></i>';">`
                          : `<i class="fas fa-user-circle"></i>`
                      }
                    </div>
                    <div class="member-info">
                      ${
                        member.url
                          ? `<a href="${member.url}" target="_blank" rel="noopener">`
                          : ''
                      }
                      <h5 class="member-name mb-1">${getLocalizedValue(
                        member,
                        'name'
                      )}</h5>
                      ${member.url ? '</a>' : ''}
                      ${
                        getLocalizedValue(member, 'affiliation')
                          ? `<p class="member-affiliation mb-0">${getLocalizedValue(
                              member,
                              'affiliation'
                            )}</p>`
                          : ''
                      }
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
      `;
    });

    contentsWrapper.innerHTML = html;
  } catch (error) {
    console.error('Error loading team members:', error);
  }
}

// 初期表示時に実行
document.addEventListener('DOMContentLoaded', loadTeamMembers);

// 言語切り替え時に再実行
document
  .querySelector('.language-select')
  ?.addEventListener('change', loadTeamMembers);
