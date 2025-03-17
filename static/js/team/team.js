// 環境ごとの設定を一元管理
const ENV_CONFIG = (() => {
  const origin = window.location.origin;
  // 環境ごとの設定マップ
  const configs = {
    'https://nanbyodata.jp': {
      branch: 'master',
      useGithub: true,
    },
    'https://dev-nanbyodata.dbcls.jp': {
      branch: 'dev',
      useGithub: true,
    },
    default: {
      useGithub: false,
    },
  };

  // 該当する環境の設定を返す、なければデフォルト設定
  return configs[origin] || configs['default'];
})();

// 環境設定から各URLを生成
const BASE_URL = ENV_CONFIG.useGithub
  ? `https://raw.githubusercontent.com/aidrd/nanbyodata/refs/heads/${ENV_CONFIG.branch}/static/img/members/`
  : '/static/img/members/';

const DATA_URL = ENV_CONFIG.useGithub
  ? `https://raw.githubusercontent.com/aidrd/nanbyodata/refs/heads/${ENV_CONFIG.branch}/static/data/members.json`
  : 'static/data/members.json';

async function loadTeamMembers() {
  try {
    const response = await fetch(DATA_URL);
    const teams = await response.json();
    const locale = document.querySelector('.language-select').value || 'en';

    const contentsWrapper = document.querySelector('.contents-wrapper');
    let html = '';

    // 言語の値を取得する関数（指定言語がない場合は英語を返す）
    const getLocalizedValue = (obj, key) => {
      return obj[key][locale] || obj[key]['en'] || '';
    };

    // 国内・海外の表記を言語に応じて変更する関数
    function getLocationLabel(locale) {
      return {
        domestic: locale === 'ja' ? '国内' : 'Domestic',
        international: locale === 'ja' ? '海外' : 'International',
      };
    }

    teams.forEach((team) => {
      // Core Development Teamは順序を変更しない
      let sortedMembers =
        team.team === 'Core Development Team'
          ? team.members
          : sortMembers(team.members, locale);

      const locationLabels = getLocationLabel(locale);

      html += `
        <div class="team-section">
          <div class="team-box">
            <h3>${team.team}</h3>
            ${
              sortedMembers.some((member) => member.location) // locationフィールドが存在するメンバーがいる場合
                ? `
                <div class="collaborators-section">
                  <h4 class="mb-3">${locationLabels.domestic}</h4>
                  <div class="row">
                    ${sortedMembers
                      .filter((member) => member.location === 'domestic')
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
                                ? `<img src="${BASE_URL}${member.image_name}" 
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
                  <h4 class="mb-3 mt-4">${locationLabels.international}</h4>
                  <div class="row">
                    ${sortedMembers
                      .filter((member) => member.location === 'international')
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
                                ? `<img src="${BASE_URL}${member.image_name}" 
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
                `
                : `
                <div class="row">
                  ${sortedMembers
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
                              ? `<img src="${BASE_URL}${member.image_name}" 
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
                `
            }
          </div>
        </div>
      `;
    });

    contentsWrapper.innerHTML = html;
  } catch (error) {
    console.error('Error loading team members:', error);
  }
}

// メンバーをソートする関数を追加
function sortMembers(members, locale) {
  members.forEach((member) => {
    if (member.name['ja']) {
      const surname =
        member.name['yomi']?.split(' ')[0] || member.name['ja'].split(' ')[0]; // 読み仮名がない場合は漢字を使用
    }
  });

  const sortedMembers = members.sort((a, b) => {
    // 日本人かどうかを判定
    const isJapaneseA = !!a.name['ja'];
    const isJapaneseB = !!b.name['ja'];

    // 日本人を先に
    if (isJapaneseA && !isJapaneseB) return -1;
    if (!isJapaneseA && isJapaneseB) return 1;

    // 日本人同士の場合は読み仮名でソート
    if (isJapaneseA && isJapaneseB) {
      const surnameA =
        a.name['yomi']?.split(' ')[0] || a.name['ja'].split(' ')[0]; // 読み仮名がない場合は漢字を使用
      const surnameB =
        b.name['yomi']?.split(' ')[0] || b.name['ja'].split(' ')[0]; // 読み仮名がない場合は漢字を使用
      return surnameA.localeCompare(surnameB, 'ja');
    }

    // 外国人同士の場合はアルファベット順
    const nameA = a.name[locale] || a.name['en'];
    const nameB = b.name[locale] || b.name['en'];
    return nameA.localeCompare(nameB, 'en');
  });

  sortedMembers.forEach((member) => {
    if (member.name['ja']) {
      const surname =
        member.name['yomi']?.split(' ')[0] || member.name['ja'].split(' ')[0]; // 読み仮名がない場合は漢字を使用
    }
  });

  return sortedMembers;
}

// 初期表示時に実行
document.addEventListener('DOMContentLoaded', loadTeamMembers);

// 言語切り替え時に再実行
document
  .querySelector('.language-select')
  ?.addEventListener('change', loadTeamMembers);
