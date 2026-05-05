import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, AlertCircle, Zap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WordData {
  word: string;
  pos: string;
  theme: string;
  trap: string;
  trap_reason: string;
  etymology: string;
  career_relevance: string;
  frequency: string;
}

export default function Home() {
  const [words, setWords] = useState<WordData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [showTrapOnly, setShowTrapOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load vocabulary data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/vocabulary-data.json');
        const data = await response.json();
        setWords(data);
      } catch (error) {
        console.error('Failed to load vocabulary data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Get unique themes and frequencies
  const themes = useMemo(() => {
    const themeSet = new Set(words.map(w => w.theme));
    return Array.from(themeSet).sort();
  }, [words]);

  const frequencies = useMemo(() => {
    const freqSet = new Set(words.map(w => w.frequency));
    return Array.from(freqSet).sort();
  }, [words]);

  // Filter words
  const filteredWords = useMemo(() => {
    return words.filter(word => {
      const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTheme = selectedTheme === 'all' || word.theme === selectedTheme;
      const matchesFrequency = selectedFrequency === 'all' || word.frequency === selectedFrequency;
      const matchesTrap = !showTrapOnly || word.trap === 'yes';

      return matchesSearch && matchesTheme && matchesFrequency && matchesTrap;
    });
  }, [words, searchTerm, selectedTheme, selectedFrequency, showTrapOnly]);

  const getFrequencyColor = (freq: string) => {
    if (freq === '★★★') return 'bg-red-100 text-red-800';
    if (freq === '★★') return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getPOSColor = (pos: string) => {
    const colors: Record<string, string> = {
      'n': 'bg-purple-100 text-purple-800',
      'v': 'bg-green-100 text-green-800',
      'adj': 'bg-pink-100 text-pink-800',
      'adv': 'bg-indigo-100 text-indigo-800',
    };
    return colors[pos] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Elin's Vocabulary Master Hub
            </h1>
          </div>
          <p className="text-gray-600">Master 300+ words from your favorite TV shows • Data Science & HCI Focus</p>
        </div>
      </header>

      <main className="container py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search words... (e.g., 'preliminary', 'conjure')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-2 text-base"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Theme Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Themes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Themes</SelectItem>
                    {themes.map(theme => (
                      <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Frequency Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Frequencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frequencies</SelectItem>
                    {frequencies.map(freq => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trap Words Toggle */}
              <div className="flex items-end">
                <Button
                  variant={showTrapOnly ? 'default' : 'outline'}
                  onClick={() => setShowTrapOnly(!showTrapOnly)}
                  className="w-full"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Trap Words Only
                </Button>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredWords.length}</span> of <span className="font-semibold text-gray-900">{words.length}</span> words
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin mb-4">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto" />
              </div>
              <p className="text-gray-600">Loading vocabulary data...</p>
            </div>
          </div>
        )}

        {/* Word Cards Grid */}
        {!loading && filteredWords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word, idx) => (
              <Card key={idx} className="p-5 hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
                {/* Word Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{word.word}</h3>
                    <Badge className={`mt-1 ${getPOSColor(word.pos)}`}>{word.pos}</Badge>
                  </div>
                  <Badge className={getFrequencyColor(word.frequency)}>{word.frequency}</Badge>
                </div>

                {/* Theme */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Theme</p>
                  <p className="text-sm text-gray-700">{word.theme}</p>
                </div>

                {/* Trap Word Warning */}
                {word.trap === 'yes' && (
                  <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-900">Trap Word</p>
                        <p className="text-xs text-amber-800 mt-1">{word.trap_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Etymology */}
                {word.etymology && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Etymology</p>
                    <p className="text-xs text-gray-600 italic">{word.etymology}</p>
                  </div>
                )}

                {/* Career Relevance */}
                {word.career_relevance === 'high' && (
                  <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    <Zap className="w-3 h-3" />
                    High relevance to DS/HCI
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredWords.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No words found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="container py-6 text-center text-sm text-gray-600">
          <p>Elin's Vocabulary Master Hub • Powered by AI-assisted learning</p>
          <p className="mt-1 text-xs text-gray-500">300+ words analyzed for theme, frequency, etymology, and career relevance</p>
        </div>
      </footer>
    </div>
  );
}
